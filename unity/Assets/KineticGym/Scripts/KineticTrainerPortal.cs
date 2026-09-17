using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace KineticGym
{
    public class KineticTrainerPortal : MonoBehaviour
    {
        public static KineticTrainerPortal Instance { get; private set; }

        [Header("Trainer Overview UI")]
        public Text totalClientsText;
        public Text activeWorkoutsText;
        public Transform clientRosterParent;
        public GameObject clientRosterCardPrefab;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            RefreshTrainerDashboard();
        }

        public void RefreshTrainerDashboard()
        {
            if (KineticFirebaseManager.Instance == null) return;

            var clients = KineticFirebaseManager.Instance.clientsList;
            if (totalClientsText != null) totalClientsText.text = clients.Count.ToString();
            if (activeWorkoutsText != null) activeWorkoutsText.text = clients.Count.ToString();

            if (clientRosterParent != null)
            {
                foreach (Transform child in clientRosterParent)
                {
                    Destroy(child.gameObject);
                }

                foreach (var client in clients)
                {
                    if (clientRosterCardPrefab != null)
                    {
                        GameObject card = Instantiate(clientRosterCardPrefab, clientRosterParent);
                        var nameTxt = card.transform.Find("Name")?.GetComponent<Text>();
                        var tierTxt = card.transform.Find("Tier")?.GetComponent<Text>();

                        if (nameTxt != null) nameTxt.text = client.name;
                        if (tierTxt != null) tierTxt.text = client.activeTier;
                    }
                }
            }
        }

        public void ApproveClientRegistration(string clientId)
        {
            Debug.Log($"[KineticGym Trainer] Client registration {clientId} approved.");
            KineticUIManager.Instance?.ShowNotification($"CLIENT {clientId} APPROVED FOR GYM PASS!");
        }
    }
}
