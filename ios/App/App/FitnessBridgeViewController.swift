import Capacitor

@objc(FitnessBridgeViewController)
public class FitnessBridgeViewController: CAPBridgeViewController {
    public override func capacitorDidLoad() {
        bridge?.registerPluginInstance(AppleHealthStepsPlugin())
    }
}
