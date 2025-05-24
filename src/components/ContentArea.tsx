/* eslint-disable no-unused-vars */
'use client'
import React, { FC, useState } from "react";
import { X } from "lucide-react";
import {
  toolbarConfig,
  getInitialConfig,
  ToolConfig,
  generateContent,
  ToolbarProps,
} from "./ToolbarConfig";

type NotificationType = 'success' | 'error';
type Notification = {
  message: string;
  type: NotificationType;
  id: number;
};

const menuItems = [
  "Linkedin Post Generation",
  "Press Release Generation",
  "Wikipedia Post Generation",
  "Marketing Copy Generation",
  "Cover Letter Generation",
  "Business Contract Generation",
  "IEEE Paper Generation",
  "X Post Generation",
  "Government Tender Generation",
  "Documentations Generation",
  "Offer Letter Generation",
  "Relieving Letter Generation",
  "Roadmap Generation",
  "Blog Post Generation",
  "Email Template Generation",
  "Advertisement Copy Generation",
  "Pitch Deck Generation",
  "Youtube Script Generation",
  "Interview Questionnaire Generation",
  "Citation Generation",
  "Property Deed Generation",
  "Case Study Generation",
  "Term & Conditions Generation",
  "Privacy Policy Generation",
  "Professional Bio Generation",
  


] as const;

type ContentType = typeof menuItems[number];

const ContentArea: FC = () => {
  const [selectedMenu, setSelectedMenu] = useState<ContentType | null>(null);
  const [toolConfig, setToolConfig] = useState<ToolConfig>(
    getInitialConfig("Linkedin Post Generation")
  );
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showModal, setShowModal] = useState(false);

  const showNotification = (message: string, type: NotificationType) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { message, type, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  const validateConfig = (
    config: ToolConfig,
    contentType: ContentType
  ): { isValid: boolean; message?: string } => {
    return { isValid: true, message: "" }; // Placeholder for validation logic
  };

  const handleGenerate = async () => {
    if (!selectedMenu) {
      showNotification("Please select a content generation tool.", "error");
      return;
    }

    const validation = validateConfig(toolConfig, selectedMenu);
    if (!validation.isValid) {
      showNotification(validation.message || "Please provide all required information.", "error");
      return;
    }

    setIsGenerating(true);
    try {
      const content = await generateContent({ ...toolConfig, toolType: selectedMenu });
      setGeneratedContent(content);
      showNotification(`${selectedMenu} generated.`, "success");
    } catch (err) {
      showNotification("Failed to generate content.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBoxClick = (menu: ContentType) => {
    setSelectedMenu(menu);
    setToolConfig(getInitialConfig(menu));
    setGeneratedContent("");
    setShowModal(true);
  };

  const handleCopy = async () => {
    if (!generatedContent) {return;}
    try {
      await navigator.clipboard.writeText(generatedContent);
      showNotification("Copied to clipboard", "success");
    } catch {
      showNotification("Failed to copy", "error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(({ message, type, id }) => (
          <div
            key={id}
            className={`px-4 py-2 rounded-md shadow-lg ${
              type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message}
          </div>
        ))}
      </div>

      {/* Box Layout - 5 in first row, 3 in second row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        {menuItems.map((item) => (
          <button
            key={item}
            className="w-full p-6 border border-blue-500 bg-gray-800 rounded-lg hover:bg-gray-700 transition text-center"
            onClick={() => handleBoxClick(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedMenu && (
        <div className="font-arial fixed inset-0 bg-black/80 backdrop-blur-sm text-white z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto relative p-6">
            <button
              className="absolute top-4 right-4 text-white hover:text-red-500"
              onClick={() => setShowModal(false)}
            >
              <X />
            </button>

            <h2 className="text-xl font-bold text-white text-center mb-4">{selectedMenu}</h2>

            <div className="bg-gray-800 p-4 rounded-md space-y-4 mb-4">
              {React.createElement(toolbarConfig[selectedMenu], {
                config: toolConfig,
                onConfigChange: (newConfig: Partial<ToolConfig>) =>
                  setToolConfig((prev) => ({ ...prev, ...newConfig })),
              } as ToolbarProps)}
            </div>

            <div className="relative bg-gray-800 p-4 rounded-md min-h-[200px]">
              <textarea
              className="w-full h-64 bg-transparent text-white outline-none resize-none font-arial"
              placeholder={`Your generated ${selectedMenu.toLowerCase()} will appear here...`}
              value={generatedContent}
              readOnly
            />
              {generatedContent && (
                <button
                  className="absolute top-2 right-2 p-2 text-white hover:text-green-400"
                  onClick={handleCopy}
                >
                  📋
                </button>
              )}
            </div>

            <button
              className={`mt-4 w-full px-6 py-2 rounded-full border border-green-500 ${
                isGenerating
                  ? "bg-gray-700 opacity-50 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-green-700 hover:text-black transition"
              }`}
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Content"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentArea;
