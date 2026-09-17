using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace KineticGym
{
    public class KineticWorkoutManager : MonoBehaviour
    {
        public static KineticWorkoutManager Instance { get; private set; }

        [Header("Active Routine Info")]
        public Text routineTitleText;
        public Text routineSubtitleText;
        public Text routineKcalText;
        public Text routineDurationText;

        [Header("Exercise List UI Container")]
        public Transform exerciseListParent;
        public GameObject exerciseCardPrefab;

        [Header("Set Logging State")]
        public Exercise currentExercise;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        public void LoadWorkoutPlan(WorkoutPlan plan)
        {
            if (plan == null) return;

            if (routineTitleText != null) routineTitleText.text = plan.title;
            if (routineSubtitleText != null) routineSubtitleText.text = plan.subtitle;
            if (routineKcalText != null) routineKcalText.text = $"{plan.targetKcal} KCAL";
            if (routineDurationText != null) routineDurationText.text = $"{plan.durationMin} MINS";

            RenderExerciseList(plan.exercises);
        }

        public void RenderExerciseList(List<Exercise> exercises)
        {
            if (exerciseListParent == null) return;

            // Clear existing UI elements
            foreach (Transform child in exerciseListParent)
            {
                Destroy(child.gameObject);
            }

            if (exercises == null) return;

            foreach (var exercise in exercises)
            {
                if (exerciseCardPrefab != null)
                {
                    GameObject card = Instantiate(exerciseCardPrefab, exerciseListParent);
                    var titleText = card.transform.Find("Title")?.GetComponent<Text>();
                    var categoryText = card.transform.Find("Category")?.GetComponent<Text>();

                    if (titleText != null) titleText.text = exercise.name;
                    if (categoryText != null) categoryText.text = $"{exercise.category} • {exercise.type}";
                }
            }
        }

        public void ToggleSetCompletion(string exerciseId, int setIndex)
        {
            if (KineticFirebaseManager.Instance == null || KineticFirebaseManager.Instance.clientsList.Count == 0) return;

            Client client = KineticFirebaseManager.Instance.clientsList[0];
            if (client.workoutPlan == null) return;

            var ex = client.workoutPlan.exercises.Find(e => e.id == exerciseId);
            if (ex != null && setIndex >= 0 && setIndex < ex.sets.Count)
            {
                ex.sets[setIndex].completed = !ex.sets[setIndex].completed;
                Debug.Log($"[KineticGym Workout] Set {setIndex + 1} for {ex.name} completed: {ex.sets[setIndex].completed}");

                KineticUIManager.Instance?.RefreshUI();
                KineticFirebaseManager.Instance.StartCoroutine(KineticFirebaseManager.Instance.SaveClientToCloud(client));
            }
        }
    }
}
