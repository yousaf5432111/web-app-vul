import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiCheckCircle,
  FiTrash2,
  FiAlertCircle,
  FiLoader,
  FiEdit,
  FiPlus,
  FiBook,
  FiAward,
  FiUsers,
  FiBarChart2,
} from "react-icons/fi";
import api from "./api";
import AIAssistant from "./AIAssistant";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("feedback");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Feedback state
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterResolved, setFilterResolved] = useState("all");

  // Challenges state
  const [challenges, setChallenges] = useState([]);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [challengeForm, setChallengeForm] = useState({
    title: "",
    instructions: "",
    difficulty: "Easy",
    max_score: 50,
    type: "practical",
    options: "[]",
    correct_answers: "[]",
    matching_pairs: "[]",
  });

  // Lessons state
  const [lessons, setLessons] = useState([]);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    resources: '[{"title":"","url":""}]',
  });

  // Users state
  const [users, setUsers] = useState([]);
  const [userProgress, setUserProgress] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/login");
    }
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [fbRes, chRes, lsRes, usRes, upRes] = await Promise.all([
        api.get("/feedback"),
        api.get("/challenges"),
        api.get("/lessons"),
        api.get("/admin/users"),
        api.get("/admin/challenges/progress"),
      ]);

      setFeedbacks(fbRes.data.data || fbRes.data);
      setChallenges(chRes.data);
      setLessons(lsRes.data);
      setUsers(usRes.data.data || usRes.data);
      setUserProgress(upRes.data.data || upRes.data);
      setLoading(false);
    } catch (e) {
      setError("Error fetching admin data");
      setLoading(false);
    }
  };

  // Feedback handlers
  const handleMarkResolved = async (feedbackId) => {
    try {
      await api.put(`/feedback/${feedbackId}`, { is_resolved: true });
      fetchAllData();
    } catch (err) {
      alert("Error marking feedback as resolved");
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await api.delete(`/feedback/${feedbackId}`);
        fetchAllData();
      } catch (err) {
        alert("Error deleting feedback");
      }
    }
  };

  // Challenge handlers
  const handleChallengeSubmit = async (e) => {
    e.preventDefault();

    // Validate JSON fields function
    const validateField = (field, value) => {
      try {
        JSON.parse(value);
        return true;
      } catch (e) {
        alert(`Invalid JSON format in ${field} field`);
        return false;
      }
    };

    // Prepare form input – if the field isn’t used for the given type, default to a valid JSON string.
    const tempForm = {
      ...challengeForm,
      options: challengeForm.type === "mcq" ? challengeForm.options : "[]",
      correct_answers:
        ["mcq", "true_false"].includes(challengeForm.type)
          ? challengeForm.correct_answers
          : "[]",
      matching_pairs:
        challengeForm.type === "matching" ? challengeForm.matching_pairs : "[]",
    };

    if (
      challengeForm.type === "mcq" &&
      !validateField("options", tempForm.options)
    )
      return;
    if (
      challengeForm.type === "true_false" &&
      !validateField("correct_answers", tempForm.correct_answers)
    )
      return;
    if (
      challengeForm.type === "matching" &&
      !validateField("matching_pairs", tempForm.matching_pairs)
    )
      return;

    try {
      const formData = {
        title: challengeForm.title,
        instructions: challengeForm.instructions,
        difficulty: challengeForm.difficulty,
        max_score: parseInt(challengeForm.max_score),
        type: challengeForm.type,
      };

      switch (challengeForm.type) {
        case "mcq": {
          console.log("MCQS");
          const options = JSON.parse(tempForm.options);
          if (!Array.isArray(options))
            throw new Error("MCQ options must be an array");
          formData.options = options;
          // For MCQs, auto-generate the correct_answers array based on each question’s correctIndex.
          formData.correct_answers = options.map((q) => q.correctIndex);
          break;
        }
        case "true_false":
          formData.correct_answers = JSON.parse(tempForm.correct_answers);
          break;
        case "matching":
          formData.matching_pairs = JSON.parse(tempForm.matching_pairs);
          break;
        default:
          break;
      }

      let response;
      if (editingChallenge) {
        response = await api.put(
          `/admin/challenges/${editingChallenge.id}`,
          formData
        );
        console.log("Editing challenge", response.data);
      } else {
        response = await api.post("/admin/challenges", formData);
        console.log("Creating challenge", response.data);
      }

      setShowChallengeForm(false);
      setEditingChallenge(null);
      fetchAllData();
    } catch (err) {
      if (err.response?.status === 422) {
        const errorMessages = Object.values(err.response.data.errors)
          .flat()
          .join("\n");
        alert(`Validation failed:\n${errorMessages}`);
      } else {
        alert(
          "Error saving challenge: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setChallengeForm({
      title: challenge.title,
      instructions: challenge.instructions,
      difficulty: challenge.difficulty,
      max_score: challenge.max_score,
      type: challenge.type,
      options:
        typeof challenge.options === "string"
          ? challenge.options
          : JSON.stringify(challenge.options, null, 2),
      correct_answers:
        typeof challenge.correct_answers === "string"
          ? challenge.correct_answers
          : JSON.stringify(challenge.correct_answers, null, 2),
      matching_pairs:
        typeof challenge.matching_pairs === "string"
          ? challenge.matching_pairs
          : JSON.stringify(challenge.matching_pairs, null, 2),
    });
    setShowChallengeForm(true);
  };

  const handleDeleteChallenge = async (id) => {
    if (window.confirm("Are you sure you want to delete this challenge?")) {
      try {
        await api.delete(`/admin/challenges/${id}`);
        fetchAllData();
      } catch (err) {
        alert("Error deleting challenge");
      }
    }
  };

  // Lesson handlers
  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...lessonForm,
        resources: JSON.parse(lessonForm.resources),
      };

      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson.id}`, formData);
      } else {
        await api.post("/admin/lessons", formData);
      }

      setShowLessonForm(false);
      setEditingLesson(null);
      fetchAllData();
    } catch (err) {
      alert("Error saving lesson");
      console.error(err);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      content: lesson.content,
      resources: JSON.stringify(lesson.resources, null, 2),
    });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (id) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await api.delete(`/admin/lessons/${id}`);
        fetchAllData();
      } catch (err) {
        alert("Error deleting lesson");
      }
    }
  };

  // User handlers
  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchAllData();
      } catch (err) {
        alert("Error deleting user");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // Render Tabs
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch =
      fb.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterResolved === "all" ||
      (filterResolved === "resolved" && fb.is_resolved) ||
      (filterResolved === "unresolved" && !fb.is_resolved);
    return matchesSearch && matchesFilter;
  });

  const renderFeedbackTab = () => (
    <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Message
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((fb) => (
                <tr key={fb.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {fb.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-300">
                      {fb.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {fb.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {fb.subject}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">
                    {fb.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < fb.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        fb.is_resolved
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {fb.is_resolved ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!fb.is_resolved && (
                      <button
                        onClick={() => handleMarkResolved(fb.id)}
                        className="text-green-600 hover:text-green-900 dark:hover:text-green-400 mr-4"
                        title="Mark as resolved"
                      >
                        <FiCheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteFeedback(fb.id)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      title="Delete feedback"
                    >
                      <FiTrash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No feedback found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderChallengesTab = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Security Challenges</h2>
        <button
          onClick={() => {
            setShowChallengeForm(true);
            setEditingChallenge(null);
            setChallengeForm({
              title: "",
              instructions: "",
              difficulty: "Medium",
              max_score: 50,
              type: "practical",
              options: "[]",
              correct_answers: "[]",
              matching_pairs: "[]",
            });
          }}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <FiPlus className="mr-2" /> Add Challenge
        </button>
      </div>

      {showChallengeForm && (
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingChallenge ? "Edit Challenge" : "Add New Challenge"}
          </h3>
          <form onSubmit={handleChallengeSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  value={challengeForm.title}
                  onChange={(e) =>
                    setChallengeForm({
                      ...challengeForm,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  value={challengeForm.difficulty}
                  onChange={(e) =>
                    setChallengeForm({
                      ...challengeForm,
                      difficulty: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructions
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                rows={3}
                value={challengeForm.instructions}
                onChange={(e) =>
                  setChallengeForm({
                    ...challengeForm,
                    instructions: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Score
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  value={challengeForm.max_score}
                  onChange={(e) =>
                    setChallengeForm({
                      ...challengeForm,
                      max_score: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  value={challengeForm.type}
                  onChange={(e) =>
                    setChallengeForm({
                      ...challengeForm,
                      type: e.target.value,
                    })
                  }
                  required
                >
                  <option value="practical">Practical</option>
                  <option value="mcq">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="matching">Matching</option>
                </select>
              </div>
            </div>

            {/* For MCQ challenges, no manual input for correct_answers */}
            {challengeForm.type === "mcq" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  MCQ Questions &amp; Options (JSON format)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={8}
                  value={challengeForm.options}
                  onChange={(e) =>
                    setChallengeForm({
                      ...challengeForm,
                      options: e.target.value,
                    })
                  }
                  placeholder={`[
  {
    "question": "What is SQL Injection?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctIndex": 0
  }
]`}
                />
              </div>
            )}

            {challengeForm.type === "true_false" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Correct Answer
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  value={challengeForm.correct_answers}
                  onChange={(e) =>
                    setChallengeForm({
                      ...challengeForm,
                      correct_answers: e.target.value,
                    })
                  }
                >
                  <option value="[true]">True</option>
                  <option value="[false]">False</option>
                </select>
              </div>
            )}

            {challengeForm.type === "matching" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Matching Pairs (JSON format)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={5}
                  value={challengeForm.matching_pairs}
                  onChange={(e) =>
                    setChallengeForm({
                      ...challengeForm,
                      matching_pairs: e.target.value,
                    })
                  }
                  placeholder={`{
  "leftColumn": [
    {"id": 1, "text": "Term 1"},
    {"id": 2, "text": "Term 2"}
  ],
  "rightColumn": [
    {"id": 101, "text": "Definition 1"},
    {"id": 102, "text": "Definition 2"}
  ],
  "correctPairs": [
    {"leftId": 1, "rightId": 101},
    {"leftId": 2, "rightId": 102}
  ]
}`}
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowChallengeForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                {editingChallenge ? "Update" : "Create"} Challenge
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {challenges.length > 0 ? (
                challenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {challenge.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {challenge.instructions}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 capitalize">
                      {challenge.type.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 capitalize">
                      {challenge.difficulty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {challenge.max_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditChallenge(challenge)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-4"
                        title="Edit challenge"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        title="Delete challenge"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No challenges found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderLessonsTab = () => {
  // Helper function to format resources JSON
  const formatResources = (resources) => {
    try {
      if (typeof resources === 'string') {
        const parsed = JSON.parse(resources);
        return JSON.stringify(parsed, null, 2);
      }
      return JSON.stringify(resources, null, 2);
    } catch (e) {
      return '[]';
    }
  };

  // Helper function to render resources preview
  const renderResourcesPreview = (resources) => {
    try {
      const parsed = typeof resources === 'string' ? JSON.parse(resources) : resources;
      if (!Array.isArray(parsed)) return null;
      
      return (
        <div className="space-y-1">
          {parsed.map((resource, index) => (
            <div key={index} className="flex items-center">
              <FiLink className="mr-2 flex-shrink-0" />
              <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-xs"
              >
                {resource.title || 'Untitled Resource'}
              </a>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return <span className="text-gray-500 dark:text-gray-400">Invalid resources format</span>;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Learning Modules</h2>
        <button
          onClick={() => {
            setShowLessonForm(true);
            setEditingLesson(null);
            setLessonForm({
              title: "",
              content: "",
              resources: JSON.stringify([{ title: "", url: "" }], null, 2),
            });
          }}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FiPlus className="mr-2" /> Add Lesson
        </button>
      </div>

      {showLessonForm && (
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingLesson ? "Edit Lesson" : "Add New Lesson"}
          </h3>
          <form onSubmit={handleLessonSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, title: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                rows={5}
                value={lessonForm.content}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, content: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Resources
              </label>
              <div className="mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Enter resources in JSON format (array of objects with "title" and "url")
                </p>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  rows={5}
                  value={lessonForm.resources}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, resources: e.target.value })
                  }
                  placeholder={`[
  {
    "title": "Video Title",
    "url": "https://example.com/video"
  },
  {
    "title": "Tutorial Link",
    "url": "https://example.com/tutorial"
  }
]`}
                  required
                />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Preview:</h4>
                {renderResourcesPreview(lessonForm.resources)}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLessonForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {editingLesson ? "Update" : "Create"} Lesson
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Resources
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        {lesson.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300 line-clamp-2 max-w-xs">
                        {lesson.content}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {renderResourcesPreview(lesson.resources)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setEditingLesson(lesson);
                          setLessonForm({
                            title: lesson.title,
                            content: lesson.content,
                            resources: formatResources(lesson.resources),
                          });
                          setShowLessonForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                        title="Edit lesson"
                      >
                        <FiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        title="Delete lesson"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No lessons found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

  const renderUsersTab = () => (
    <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Admin
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {user.is_admin ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {!user.is_admin && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        title="Delete user"
                        disabled={
                          user.id.toString() === localStorage.getItem("userId")
                        }
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProgressTab = () => (
    <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Challenge
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Completed At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
            {userProgress.length > 0 ? (
              userProgress.map((progress) => (
                <tr
                  key={progress.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                      {progress.user?.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {progress.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {progress.challenge?.title || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {progress.score} /{" "}
                    {progress.challenge?.max_score || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {new Date(progress.completed_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No progress data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "feedback":
        return renderFeedbackTab();
      case "challenges":
        return renderChallengesTab();
      case "lessons":
        return renderLessonsTab();
      case "users":
        return renderUsersTab();
      case "progress":
        return renderProgressTab();
      default:
        return <div>Invalid tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage all system content and users
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center mt-4 md:mt-0 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <FiLogOut className="mr-2" /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "feedback"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <FiAlertCircle className="mr-2" /> Feedback
          </button>
          <button
            onClick={() => setActiveTab("challenges")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "challenges"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <FiAward className="mr-2" /> Challenges
          </button>
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "lessons"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <FiBook className="mr-2" /> Lessons
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <FiUsers className="mr-2" /> Users
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === "progress"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            <FiBarChart2 className="mr-2" /> Progress
          </button>
        </div>

        {/* Filters for Feedback tab */}
        {activeTab === "feedback" && (
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search feedback..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  value={filterResolved}
                  onChange={(e) => setFilterResolved(e.target.value)}
                >
                  <option value="all">All Feedback</option>
                  <option value="resolved">Resolved Only</option>
                  <option value="unresolved">Unresolved Only</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchAllData}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin text-4xl text-blue-500" />
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg flex items-center">
            <FiAlertCircle className="mr-2" /> {error}
          </div>
        ) : (
          renderTabContent()
        )}
      </div>
      <AIAssistant />
    </div>
  );
}
