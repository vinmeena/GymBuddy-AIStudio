using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace KineticGym
{
    public class KineticCardioTracker : MonoBehaviour
    {
        public static KineticCardioTracker Instance { get; private set; }

        [Header("Cardio Logging Input Fields")]
        public InputField typeInputField;
        public InputField distanceInputField;
        public InputField durationInputField;
        public InputField heartRateInputField;

        [Header("Cardio Log UI Display")]
        public Text distanceDisplayText;
        public Text durationDisplayText;
        public Text paceDisplayText;
        public Text bpmDisplayText;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void LogCardioSession()
        {
            if (KineticFirebaseManager.Instance == null || KineticFirebaseManager.Instance.clientsList.Count == 0) return;

            Client client = KineticFirebaseManager.Instance.clientsList[0];

            float dist = 0f;
            if (distanceInputField != null) float.TryParse(distanceInputField.text, out dist);

            int bpm = 145;
            if (heartRateInputField != null) int.TryParse(heartRateInputField.text, out bpm);

            string type = typeInputField != null && !string.IsNullOrEmpty(typeInputField.text) ? typeInputField.text : "RUN";
            string timeMin = durationInputField != null && !string.IsNullOrEmpty(durationInputField.text) ? durationInputField.text : "25:00";

            CardioLog newLog = new CardioLog
            {
                id = Guid.NewGuid().ToString(),
                date = DateTime.Now.ToString("yyyy-MM-dd"),
                type = type.ToUpper(),
                distanceKm = dist > 0 ? dist : 5.0f,
                timeMin = timeMin,
                avgHeartRate = bpm,
                pace = "5:10/KM"
            };

            client.cardioLogs.Add(newLog);

            if (distanceDisplayText != null) distanceDisplayText.text = $"{newLog.distanceKm:F2} KM";
            if (durationDisplayText != null) durationDisplayText.text = newLog.timeMin;
            if (paceDisplayText != null) paceDisplayText.text = newLog.pace;
            if (bpmDisplayText != null) bpmDisplayText.text = $"{newLog.avgHeartRate} BPM";

            KineticUIManager.Instance?.ShowNotification("CARDIO LOGGED & SYNCHRONIZED SECURELY!");
            KineticFirebaseManager.Instance.StartCoroutine(KineticFirebaseManager.Instance.SaveClientToCloud(client));
        }
    }
}
