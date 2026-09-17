using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace KineticGym
{
    public class KineticUIManager : MonoBehaviour
    {
        public static KineticUIManager Instance { get; private set; }

        [Header("UI Views")]
        public GameObject clientDashboardPanel;
        public GameObject workoutRoutinePanel;
        public GameObject trainerDashboardPanel;
        public GameObject chatPanel;

        [Header("Header Text Elements")]
        public Text clientNameText;
        public Text clientLevelBadgeText;
        public Text workoutTitleText;
        public Text workoutSubtitleText;
        public Text workoutDurationText;
        public Text workoutKcalText;

        [Header("Macro Progress Bars")]
        public Image proteinBarFill;
        public Text proteinText;
        public Image carbsBarFill;
        public Text carbsText;
        public Image fatsBarFill;
        public Text fatsText;

        [Header("Buttons & Interactive Elements")]
        public Button completeDailyLogButton;
        public Text completeButtonText;
        public Text statusNotificationText;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Start()
        {
            if (KineticFirebaseManager.Instance != null)
            {
                KineticFirebaseManager.Instance.OnDataSynchronized += RefreshUI;
            }

            if (completeDailyLogButton != null)
            {
                completeDailyLogButton.onClick.AddListener(OnCompleteDailyLogClicked);
            }

            RefreshUI();
        }

        private void OnDestroy()
        {
            if (KineticFirebaseManager.Instance != null)
            {
                KineticFirebaseManager.Instance.OnDataSynchronized -= RefreshUI;
            }
        }

        public void RefreshUI()
        {
            if (KineticFirebaseManager.Instance == null || KineticFirebaseManager.Instance.clientsList.Count == 0)
                return;

            Client currentClient = KineticFirebaseManager.Instance.clientsList[0];

            if (clientNameText != null) clientNameText.text = currentClient.name.ToUpper();
            if (clientLevelBadgeText != null) clientLevelBadgeText.text = currentClient.level.ToUpper();

            if (currentClient.workoutPlan != null)
            {
                if (workoutTitleText != null) workoutTitleText.text = currentClient.workoutPlan.title;
                if (workoutSubtitleText != null) workoutSubtitleText.text = currentClient.workoutPlan.subtitle;
                if (workoutDurationText != null) workoutDurationText.text = $"{currentClient.workoutPlan.durationMin} MINS";
                if (workoutKcalText != null) workoutKcalText.text = $"{currentClient.workoutPlan.targetKcal} KCAL";
            }

            if (currentClient.dietPlan != null && currentClient.dietPlan.macros != null)
            {
                var macros = currentClient.dietPlan.macros;
                if (proteinBarFill != null && macros.protein.target > 0)
                    proteinBarFill.fillAmount = Mathf.Clamp01((float)macros.protein.current / macros.protein.target);
                if (proteinText != null) proteinText.text = $"{macros.protein.current} / {macros.protein.target}g";

                if (carbsBarFill != null && macros.carbs.target > 0)
                    carbsBarFill.fillAmount = Mathf.Clamp01((float)macros.carbs.current / macros.carbs.target);
                if (carbsText != null) carbsText.text = $"{macros.carbs.current} / {macros.carbs.target}g";

                if (fatsBarFill != null && macros.fats.target > 0)
                    fatsBarFill.fillAmount = Mathf.Clamp01((float)macros.fats.current / macros.fats.target);
                if (fatsText != null) fatsText.text = $"{macros.fats.current} / {macros.fats.target}g";
            }
        }

        public void OnCompleteDailyLogClicked()
        {
            ShowNotification("SYNCHRONIZING DAILY LOG TO CLOUD LEDGER...");
            if (KineticFirebaseManager.Instance != null && KineticFirebaseManager.Instance.clientsList.Count > 0)
            {
                Client activeClient = KineticFirebaseManager.Instance.clientsList[0];
                StartCoroutine(KineticFirebaseManager.Instance.SaveClientToCloud(activeClient, (success) =>
                {
                    if (success)
                    {
                        ShowNotification("DAILY LOG SYNCHRONIZED. GYM STREAK MAINTAINED!");
                        if (completeButtonText != null) completeButtonText.text = "DAILY LOG SYNCHRONIZED ✓";
                    }
                    else
                    {
                        ShowNotification("LOG SAVED LOCALLY. WILL SYNC WHEN ONLINE.");
                    }
                }));
            }
        }

        public void ShowNotification(string message)
        {
            if (statusNotificationText != null)
            {
                statusNotificationText.text = message;
                CancelInvoke(nameof(ClearNotification));
                Invoke(nameof(ClearNotification), 4f);
            }
            Debug.Log("[KineticGym UI] " + message);
        }

        private void ClearNotification()
        {
            if (statusNotificationText != null)
            {
                statusNotificationText.text = "";
            }
        }

        public void SwitchTab(string tabName)
        {
            if (clientDashboardPanel != null) clientDashboardPanel.SetActive(tabName == "DASHBOARD");
            if (workoutRoutinePanel != null) workoutRoutinePanel.SetActive(tabName == "ROUTINE");
            if (trainerDashboardPanel != null) trainerDashboardPanel.SetActive(tabName == "TRAINER");
            if (chatPanel != null) chatPanel.SetActive(tabName == "CHAT");
        }
    }
}
