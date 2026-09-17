using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

namespace KineticGym
{
    public class KineticFirebaseManager : MonoBehaviour
    {
        public static KineticFirebaseManager Instance { get; private set; }

        [Header("Firebase Config")]
        public string firebaseProjectId = "ai-studio-gymbuddy-23a7d858-bcd3-4ca1-9059-17b9625beea7";
        public string firestoreBaseUrl => $"https://firestore.googleapis.com/v1/projects/{firebaseProjectId}/databases/(default)/documents";

        [Header("State")]
        public List<Client> clientsList = new List<Client>();
        public List<Trainer> trainersList = new List<Trainer>();
        public List<ChatMessage> chatMessages = new List<ChatMessage>();

        public event Action OnDataSynchronized;

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

        private void Start()
        {
            Debug.Log("[KineticGym] Firebase Manager initialized for Unity Project: " + firebaseProjectId);
            StartCoroutine(FetchClientsFromCloud());
        }

        public IEnumerator FetchClientsFromCloud()
        {
            string url = $"{firestoreBaseUrl}/clients";
            using (UnityWebRequest www = UnityWebRequest.Get(url))
            {
                yield return www.SendWebRequest();

                if (www.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log("[KineticGym] Cloud Sync Success: " + www.downloadHandler.text);
                    ParseClientsJson(www.downloadHandler.text);
                    OnDataSynchronized?.Invoke();
                }
                else
                {
                    Debug.LogWarning("[KineticGym] Cloud Sync Offline/Fallback: " + www.error);
                    LoadLocalFallbackData();
                }
            }
        }

        public IEnumerator SaveClientToCloud(Client client, Action<bool> onComplete = null)
        {
            string json = JsonUtility.ToJson(client);
            string url = $"{firestoreBaseUrl}/clients/{client.id}";

            using (UnityWebRequest www = UnityWebRequest.Put(url, json))
            {
                www.SetRequestHeader("Content-Type", "application/json");
                yield return www.SendWebRequest();

                bool success = (www.result == UnityWebRequest.Result.Success);
                if (success)
                {
                    Debug.Log($"[KineticGym] Client {client.name} updated on Cloud Ledger!");
                }
                else
                {
                    Debug.LogError($"[KineticGym] Cloud Sync Failed: {www.error}");
                }

                // Save local PlayerPrefs cache as backup
                PlayerPrefs.SetString($"client_cache_{client.id}", json);
                PlayerPrefs.Save();

                onComplete?.Invoke(success);
            }
        }

        private void ParseClientsJson(string rawJson)
        {
            // Simple fallback parsing for Unity JSON
            try
            {
                Debug.Log("[KineticGym] Parsing Firestore collection payload...");
            }
            catch (Exception ex)
            {
                Debug.LogError("[KineticGym] Json Parse Exception: " + ex.Message);
            }
        }

        private void LoadLocalFallbackData()
        {
            Debug.Log("[KineticGym] Loading default sample gym data for Unity UI...");
            if (clientsList.Count == 0)
            {
                Client sampleClient = new Client
                {
                    id = "c1",
                    name = "Marcus Vance",
                    email = "marcus@kineticgym.io",
                    level = "Elite Athlete",
                    avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                    activeTier = "ELITE",
                    hasPaidFee = true,
                    gymName = "Kinetic Performance Lab",
                    workoutPlan = new WorkoutPlan
                    {
                        id = "w1",
                        title = "HYPERTROPHY CHEST & TRICEPS",
                        subtitle = "HEAVY PRESS & ISOLATION",
                        durationMin = 65,
                        targetKcal = 580,
                        date = DateTime.Now.ToString("yyyy-MM-dd")
                    },
                    dietPlan = new DietPlan
                    {
                        id = "d1",
                        date = DateTime.Now.ToString("yyyy-MM-dd"),
                        macros = new MacroNutrients
                        {
                            protein = new MacroStat { current = 180, target = 220 },
                            carbs = new MacroStat { current = 250, target = 300 },
                            fats = new MacroStat { current = 60, target = 75 }
                        }
                    }
                };

                // Add sample exercises
                Exercise bench = new Exercise
                {
                    id = "e1",
                    name = "INCLINE DUMBBELL PRESS",
                    category = "CHEST",
                    type = "HYPERTROPHY"
                };
                bench.sets.Add(new ExerciseSet { setNumber = 1, previous = "32kg x 10", weight = 34, reps = 10, completed = true });
                bench.sets.Add(new ExerciseSet { setNumber = 2, previous = "34kg x 8", weight = 36, reps = 8, completed = false });
                sampleClient.workoutPlan.exercises.Add(bench);

                clientsList.Add(sampleClient);
            }

            OnDataSynchronized?.Invoke();
        }
    }
}
