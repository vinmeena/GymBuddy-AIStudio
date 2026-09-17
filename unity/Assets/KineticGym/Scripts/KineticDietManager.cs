using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace KineticGym
{
    public class KineticDietManager : MonoBehaviour
    {
        public static KineticDietManager Instance { get; private set; }

        [Header("Macro Summary UI")]
        public Image proteinGauge;
        public Text proteinLabel;
        public Image carbsGauge;
        public Text carbsLabel;
        public Image fatsGauge;
        public Text fatsLabel;

        [Header("Meal List Container")]
        public Transform mealListParent;
        public GameObject mealCardPrefab;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void RenderDietPlan(DietPlan dietPlan)
        {
            if (dietPlan == null) return;

            if (dietPlan.macros != null)
            {
                if (proteinGauge != null && dietPlan.macros.protein.target > 0)
                    proteinGauge.fillAmount = (float)dietPlan.macros.protein.current / dietPlan.macros.protein.target;
                if (proteinLabel != null)
                    proteinLabel.text = $"{dietPlan.macros.protein.current} / {dietPlan.macros.protein.target}g";

                if (carbsGauge != null && dietPlan.macros.carbs.target > 0)
                    carbsGauge.fillAmount = (float)dietPlan.macros.carbs.current / dietPlan.macros.carbs.target;
                if (carbsLabel != null)
                    carbsLabel.text = $"{dietPlan.macros.carbs.current} / {dietPlan.macros.carbs.target}g";

                if (fatsGauge != null && dietPlan.macros.fats.target > 0)
                    fatsGauge.fillAmount = (float)dietPlan.macros.fats.current / dietPlan.macros.fats.target;
                if (fatsLabel != null)
                    fatsLabel.text = $"{dietPlan.macros.fats.current} / {dietPlan.macros.fats.target}g";
            }

            RenderMealList(dietPlan.meals);
        }

        public void RenderMealList(List<Meal> meals)
        {
            if (mealListParent == null) return;

            foreach (Transform child in mealListParent)
            {
                Destroy(child.gameObject);
            }

            if (meals == null) return;

            foreach (var meal in meals)
            {
                if (mealCardPrefab != null)
                {
                    GameObject card = Instantiate(mealCardPrefab, mealListParent);
                    var timeLabel = card.transform.Find("TimeLabel")?.GetComponent<Text>();
                    var nameText = card.transform.Find("Name")?.GetComponent<Text>();
                    var macroText = card.transform.Find("MacroSummary")?.GetComponent<Text>();

                    if (timeLabel != null) timeLabel.text = meal.timeLabel;
                    if (nameText != null) nameText.text = meal.name;
                    if (macroText != null) macroText.text = $"{meal.kcal} KCAL • {meal.proteinG}g PROTEIN";
                }
            }
        }

        public void ToggleMealLogged(string mealId)
        {
            if (KineticFirebaseManager.Instance == null || KineticFirebaseManager.Instance.clientsList.Count == 0) return;

            Client client = KineticFirebaseManager.Instance.clientsList[0];
            if (client.dietPlan == null) return;

            Meal meal = client.dietPlan.meals.Find(m => m.id == mealId);
            if (meal != null)
            {
                meal.completed = !meal.completed;
                Debug.Log($"[KineticGym Diet] Meal '{meal.name}' log toggled: {meal.completed}");
                KineticFirebaseManager.Instance.StartCoroutine(KineticFirebaseManager.Instance.SaveClientToCloud(client));
            }
        }
    }
}
