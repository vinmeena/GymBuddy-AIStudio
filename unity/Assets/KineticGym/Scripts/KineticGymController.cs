using UnityEngine;

namespace KineticGym
{
    public class KineticGymController : MonoBehaviour
    {
        [Header("App Identity")]
        public string appName = "Kinetic Gym Buddy & Performance Hub";
        public string version = "1.0.0";

        [Header("User State")]
        public string activeRole = "CLIENT"; // "CLIENT", "TRAINER", "OWNER"
        public string activeUserId = "c1";

        private void Start()
        {
            Debug.Log($"==========================================");
            Debug.Log($"      {appName} v{version}");
            Debug.Log($"      Role: {activeRole} | User: {activeUserId}");
            Debug.Log($"==========================================");

            Application.targetFrameRate = 60;
        }

        public void TriggerHapticFeedback()
        {
#if UNITY_ANDROID || UNITY_IOS
            Handheld.Vibrate();
#endif
        }
    }
}
