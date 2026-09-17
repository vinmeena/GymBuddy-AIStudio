using System;
using System.Runtime.InteropServices;
using UnityEngine;

namespace KineticGym
{
    public class KineticWebBridge : MonoBehaviour
    {
        public static KineticWebBridge Instance { get; private set; }

        [Header("Settings")]
        public string webAppUrl = "https://ais-dev-ucwodfvuhzeskpu6wpgsxo-437728651370.asia-southeast1.run.app";

#if UNITY_WEBGL && !UNITY_EDITOR
        [DllImport("__Internal")]
        private static extern void SendToReactApp(string eventName, string jsonPayload);
#endif

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        public void SendDataToWeb(string eventName, string jsonPayload)
        {
            Debug.Log($"[KineticWebBridge] Sending event '{eventName}' to Web App: {jsonPayload}");
#if UNITY_WEBGL && !UNITY_EDITOR
            try
            {
                SendToReactApp(eventName, jsonPayload);
            }
            catch (Exception ex)
            {
                Debug.LogWarning("[KineticWebBridge] WebGL Bridge call failed: " + ex.Message);
            }
#endif
        }

        // Called from JavaScript via SendMessage("KineticWebBridge", "OnWebMessageReceived", payload)
        public void OnWebMessageReceived(string jsonMessage)
        {
            Debug.Log($"[KineticWebBridge] Message received from Web App: {jsonMessage}");
            if (KineticFirebaseManager.Instance != null)
            {
                KineticFirebaseManager.Instance.StartCoroutine(KineticFirebaseManager.Instance.FetchClientsFromCloud());
            }
        }
    }
}
