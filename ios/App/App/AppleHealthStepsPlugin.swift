import Capacitor
import Foundation
import HealthKit

@objc(AppleHealthStepsPlugin)
public class AppleHealthStepsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AppleHealthStepsPlugin"
    public let jsName = "AppleHealthSteps"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getAccessState", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestReadAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readDailyStepTotals", returnType: CAPPluginReturnPromise)
    ]

    private let healthStore = HKHealthStore()
    private let authorizationRequestedKey = "fitness-os-apple-health-steps-authorization-requested"

    private var stepType: HKQuantityType? {
        HKObjectType.quantityType(forIdentifier: .stepCount)
    }

    @objc func getAccessState(_ call: CAPPluginCall) {
        resolveAccessState(call)
    }

    @objc func requestReadAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(), let stepType else {
            call.resolve(unavailableState())
            return
        }

        healthStore.requestAuthorization(toShare: [], read: [stepType]) { [weak self] _, error in
            guard let self else { return }
            if let error {
                call.reject("Apple Health authorization could not be requested.", nil, error)
                return
            }

            UserDefaults.standard.set(true, forKey: self.authorizationRequestedKey)
            self.resolveAccessState(call)
        }
    }

    @objc func readDailyStepTotals(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(), let stepType else {
            call.resolve(["totals": []])
            return
        }
        guard
            let startText = call.getString("startDate"),
            let endText = call.getString("endDate"),
            let startDate = parseLocalDate(startText),
            let inclusiveEndDate = parseLocalDate(endText),
            let exclusiveEndDate = Calendar.current.date(byAdding: .day, value: 1, to: inclusiveEndDate),
            startDate <= inclusiveEndDate
        else {
            call.reject("A valid inclusive YYYY-MM-DD date range is required.")
            return
        }

        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: exclusiveEndDate,
            options: .strictStartDate
        )
        let query = HKStatisticsCollectionQuery(
            quantityType: stepType,
            quantitySamplePredicate: predicate,
            options: .cumulativeSum,
            anchorDate: Calendar.current.startOfDay(for: startDate),
            intervalComponents: DateComponents(day: 1)
        )

        query.initialResultsHandler = { [weak self] _, collection, error in
            guard let self else { return }
            if let error {
                call.reject("Apple Health step totals could not be read.", nil, error)
                return
            }

            var totals: [[String: Any]] = []
            collection?.enumerateStatistics(
                from: startDate,
                to: exclusiveEndDate
            ) { statistics, _ in
                guard let quantity = statistics.sumQuantity() else { return }
                totals.append([
                    "date": self.formatLocalDate(statistics.startDate),
                    "steps": Int(quantity.doubleValue(for: .count()).rounded())
                ])
            }
            call.resolve(["totals": totals])
        }

        healthStore.execute(query)
    }

    private func resolveAccessState(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable(), let stepType else {
            call.resolve(unavailableState())
            return
        }

        var state: [String: Any] = [
            "availability": "Available",
            "authorizationRequested": UserDefaults.standard.bool(forKey: authorizationRequestedKey)
        ]

        if #available(iOS 17.0, *) {
            Task {
                do {
                    let dates = try await healthStore.earliestAuthorizedSampleDate(for: [stepType])
                    if let earliestDate = dates[stepType] {
                        state["earliestAuthorizedDate"] = formatLocalDate(earliestDate)
                    }
                    call.resolve(state)
                } catch {
                    // Apple intentionally hides denied read access. Absence of
                    // an earliest date is therefore not treated as an error.
                    call.resolve(state)
                }
            }
            return
        }

        call.resolve(state)
    }

    private func unavailableState() -> [String: Any] {
        [
            "availability": "Unavailable",
            "authorizationRequested": false
        ]
    }

    private func parseLocalDate(_ value: String) -> Date? {
        let formatter = localDateFormatter()
        guard let date = formatter.date(from: value), formatter.string(from: date) == value else {
            return nil
        }
        return Calendar.current.startOfDay(for: date)
    }

    private func formatLocalDate(_ date: Date) -> String {
        localDateFormatter().string(from: date)
    }

    private func localDateFormatter() -> DateFormatter {
        let formatter = DateFormatter()
        formatter.calendar = Calendar.current
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone.current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }
}
