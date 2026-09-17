using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace KineticGym
{
    public class KineticChatController : MonoBehaviour
    {
        public static KineticChatController Instance { get; private set; }

        [Header("Chat UI Elements")]
        public Transform messageFeedParent;
        public GameObject messageBubblePrefab;
        public InputField messageInputField;
        public Button sendButton;

        private void Awake()
        {
            if (Instance == null) Instance = this;
            else Destroy(gameObject);
        }

        private void Start()
        {
            if (sendButton != null)
            {
                sendButton.onClick.AddListener(SendMessageFromInput);
            }

            // Load initial welcome message
            AddMessageToFeed("Coach Vance", "Welcome to Kinetic Performance! Let me know if you need macro or exercise adjustments.", false);
        }

        public void SendMessageFromInput()
        {
            if (messageInputField == null || string.IsNullOrWhiteSpace(messageInputField.text)) return;

            string text = messageInputField.text.Trim();
            AddMessageToFeed("You", text, true);
            messageInputField.text = "";

            // Simulate Trainer Auto-Reply for demo
            Invoke(nameof(SimulateTrainerReply), 1.5f);
        }

        public void AddMessageToFeed(string senderName, string text, bool isSelf)
        {
            if (messageFeedParent == null) return;

            GameObject bubble = new GameObject("ChatBubble", typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            bubble.transform.SetParent(messageFeedParent, false);

            Image bg = bubble.GetComponent<Image>();
            bg.color = isSelf ? new Color(0.64f, 0.90f, 0.21f, 0.2f) : new Color(0.15f, 0.15f, 0.17f, 0.8f);

            GameObject txtObj = new GameObject("Text", typeof(RectTransform), typeof(Text));
            txtObj.transform.SetParent(bubble.transform, false);

            Text label = txtObj.GetComponent<Text>();
            label.font = Font.CreateDynamicFontFromOSFont("Arial", 14);
            label.fontSize = 14;
            label.color = isSelf ? Color.white : new Color(0.9f, 0.9f, 0.9f);
            label.text = $"<b>{senderName}</b>\n{text}";

            RectTransform rect = bubble.GetComponent<RectTransform>();
            rect.sizeDelta = new Vector2(400, 60);

            Debug.Log($"[KineticGym Chat] {senderName}: {text}");
        }

        private void SimulateTrainerReply()
        {
            AddMessageToFeed("Coach Vance", "Got it! Your set numbers and rest timer targets look great. Keep pushing!", false);
        }
    }
}
