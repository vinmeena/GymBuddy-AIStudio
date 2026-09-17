# Kinetic Gym Buddy & Performance Hub - Unity Package Setup Guide

Welcome to the **Kinetic Gym Buddy** Unity Package!

This package contains full C# scripts, Unity Canvas UI components, Firebase Firestore integration, data models, and web bridge adapters to run Kinetic Gym in Unity.

---

## 🚀 How to Import into Unity

1. Open **Unity Editor** (Compatible with **Unity 2021.3 LTS, 2022.3 LTS, 2023.2, and Unity 6 / 6000 LTS**).
2. Create or open your Unity 2D / 3D / Universal Render Pipeline (URP) Project.
3. In the top menu, go to **Assets -> Import Package -> Custom Package...**
4. Select `KineticGym_v1.0.unitypackage` from your computer.
5. In the Import window, ensure all items under `Assets/KineticGym/` are selected, then click **Import**.

---

## 📁 Included Assets & C# Scripts

| File / Folder | Description |
| :--- | :--- |
| `KineticDataModels.cs` | Complete C# `[Serializable]` classes matching all TypeScript types (`Client`, `Trainer`, `WorkoutPlan`, `Exercise`, `DietPlan`, `CardioLog`, `Supplement`, `WellnessCheckIn`). |
| `KineticFirebaseManager.cs` | High-performance C# MonoBehaviour managing Firestore REST API requests (`UnityWebRequest`), client syncing, daily logs, and local caching. |
| `KineticUIManager.cs` | C# MonoBehaviour driving Unity Canvas UI elements, progress bar fills, headers, buttons, and notifications. |
| `KineticGymController.cs` | Main orchestrator MonoBehaviour managing active user state, role selection, target frame rates, and haptics. |
| `KineticWebBridge.cs` | Two-way communication bridge for Unity WebGL and embedded WebViews (UniWebView, Vuplex, WebGL iframe bridge). |
| `WebBuild/` | Built web application assets (`dist/`), ready to be embedded or loaded in Unity WebGL / Web View plugins. |

---

## 🛠️ Setting Up Your Scene in Unity

1. In your Scene Hierarchy, create a new Empty GameObject and name it `[KineticGymController]`.
2. Attach the following scripts to `[KineticGymController]`:
   - `KineticGymController.cs`
   - `KineticFirebaseManager.cs`
   - `KineticUIManager.cs`
   - `KineticWebBridge.cs`
3. Create a **UI -> Canvas** in your scene (`CanvasScaler` UI mode: *Scale With Screen Size*, Reference Resolution: `1080 x 1920` for mobile or `1920 x 1080` for desktop).
4. Assign your Canvas Text, Image, and Button references to the inspectable fields on `KineticUIManager`.
5. Press **Play** in Unity Editor!

---

## ⚡ Firebase Firestore Configuration

The default Firebase Project ID is pre-configured to:
`ai-studio-gymbuddy-23a7d858-bcd3-4ca1-9059-17b9625beea7`

If you want to connect your own Firebase Firestore instance:
1. Select `[KineticGymController]` in the Inspector.
2. Update the `Firebase Project Id` field in `KineticFirebaseManager` to your project ID.

---

## 📱 Building for Android & iOS in Unity

1. Go to **File -> Build Settings**.
2. Select **Android** or **iOS** and click **Switch Platform**.
3. Under **Player Settings**:
   - Set **Company Name** & **Product Name** (`Kinetic Gym`).
   - Set **Minimum API Level**: Android 7.0 (API 24) or iOS 12.0+.
4. Click **Build and Run**!
