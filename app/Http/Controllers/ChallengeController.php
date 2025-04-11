<?php

namespace App\Http\Controllers;

use App\Models\Challenge;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ChallengeController extends Controller
{
    public function index()
    {
        $challenges = Challenge::all();
        return response()->json($challenges);
    }

    public function show($id)
    {
        $challenge = Challenge::findOrFail($id);
        return response()->json($challenge);
    }

    public function userChallenges()
    {
        $user = Auth::user();
        $completedChallenges = UserProgress::where('user_id', $user->id)
            ->where('completed', true)
            ->pluck('challenge_id');

        $allChallenges = Challenge::all();
        $allChallenges->each(function ($challenge) use ($completedChallenges) {
            $challenge->completed = $completedChallenges->contains($challenge->id);
        });

        return response()->json($allChallenges);
    }

    public function evaluate(Request $request, $id)
    {
        $request->validate([
            'payload' => 'required',
        ]);

        $challenge = Challenge::findOrFail($id);
        $result = false;
        $message = '';
        $userId = $request->user_id;

        try {
            switch ($challenge->type) {
                case 'practical':
                    switch ($challenge->title) {
                        case 'SQL Injection Login Bypass':
                            $result = $this->containsSqlInjection($request->payload);
                            $message = $result
                                ? 'Challenge passed! SQL Injection successful.'
                                : 'Challenge failed. SQL Injection unsuccessful.';
                            break;
                            case 'Simulated CSRF Attack':
                                // Ensure payload is a string
                                if (!is_string($request->payload)) {
                                    return response()->json([
                                        'result' => false,
                                        'message' => 'Invalid payload format. Payload must be a JSON string.'
                                    ], 400);
                                }
                            
                                // Decode JSON string
                                $decodedPayload = json_decode($request->payload, true);
                            
                                if (!is_array($decodedPayload)) {
                                    return response()->json([
                                        'result' => false,
                                        'message' => 'Invalid JSON payload.'
                                    ], 400);
                                }
                            
                                // Check if payload has more than 1 key
                                if (count($decodedPayload) < 2) {
                                    return response()->json([
                                        'result' => false,
                                        'message' => 'Payload must contain at least two fields.'
                                    ], 400);
                                }
                            
                                // Evaluate CSRF attack simulation
                                $result = $this->simulateCsrfAttack($decodedPayload);
                                $message = $result
                                    ? 'Challenge passed! CSRF attack simulated successfully.'
                                    : 'Challenge failed. CSRF attack not successful.';
                                break;
                    }
                    break;
                case 'mcq':
                    $result = $this->evaluateMcq($challenge, $request->payload);
                    $message = $result ? 'Correct answer!' : 'Incorrect answer. Try again.';
                    break;
                case 'true_false':
                    $result = $this->evaluateTrueFalse($challenge, $request->payload);
                    $message = $result ? 'Correct answer!' : 'Incorrect answer. Try again.';
                    break;
                case 'matching':
                    $result = $this->evaluateMatching($challenge, $request->payload);
                    $message = $result
                        ? 'All matches correct!'
                        : 'Some matches are incorrect. Try again.';
                    break;
                default:
                    $result = false;
                    $message = 'Unknown challenge type.';
                    break;
            }

            if ($result && $userId) {
                UserProgress::updateOrCreate(
                    ['user_id' => $userId, 'challenge_id' => $challenge->id],
                    [
                        'completed' => true,
                        'completed_at' => now(),
                        'score' => $challenge->max_score,
                    ]
                );

                Log::info('Challenge completed', [
                    'user_id' => $userId,
                    'challenge_id' => $challenge->id,
                    'challenge_title' => $challenge->title,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Challenge evaluation error', [
                'challenge_id' => $challenge->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'result' => false,
                'message' =>
                    'An error occurred while evaluating the challenge.',
            ], 500);
        }

        return response()->json([
            'result' => $result,
            'message' => $message,
            'challenge_id' => $challenge->id,
            'score' => $result ? $challenge->max_score : 0,
        ], $result ? 200 : 400);
    }

    private function containsSqlInjection($input)
    {
        $pattern =
            '/(\b(SELECT|INSERT|DELETE|UPDATE|DROP|ALTER)\b|\b(OR|AND)\b|\=\=|\-\-|\#|\/\*|\'\s*OR\s*\'.*\'\s*\=\s*\'|\'\s*OR\s*1\s*\=\s*1)/i';
        return preg_match($pattern, $input);
    }

    private function simulateCsrfAttack($data)
{
    // $data is already decoded array
    return !isset($data['csrf_token']) || empty($data['csrf_token']);
}


    public function getByDifficulty($difficulty)
    {
        $challenges = Challenge::where("difficulty", $difficulty)->get();
        return response()->json($challenges);
    }

    public function leaderboard()
    {
        try {
            $leaderboard = DB::table("users")
                ->join("user_progress", "users.id", "=", "user_progress.user_id")
                ->join(
                    "challenges",
                    "user_progress.challenge_id",
                    "=",
                    "challenges.id"
                )
                ->where("user_progress.completed", true)
                ->whereNotNull("user_progress.challenge_id")
                ->select(
                    "users.id",
                    "users.name",
                    "users.email",
                    DB::raw(
                        "COALESCE(SUM(user_progress.score), 0) as total_score"
                    ),
                    DB::raw(
                        "COUNT(DISTINCT user_progress.challenge_id) as challenges_completed"
                    )
                )
                ->groupBy("users.id", "users.name", "users.email")
                ->orderBy("total_score", "desc")
                ->take(10)
                ->get();

            return response()->json($leaderboard);
        } catch (\Exception $e) {
            Log::error("Leaderboard error: " . $e->getMessage());
            return response()->json([
                "error" => "Failed to load leaderboard",
                "details" => $e->getMessage(),
            ], 500);
        }
    }

    private function evaluateMcq($challenge, $userAnswers)
    {
        $correctAnswers = is_string($challenge->correct_answers)
            ? json_decode($challenge->correct_answers, true)
            : $challenge->correct_answers;

        // If it's a single-question MCQ (backward compatibility)
        if (isset($correctAnswers["correctIndex"])) {
            return $userAnswers == $correctAnswers["correctIndex"];
        }

        // For multiple questions
        if (!is_array($userAnswers)) {
            return false;
        }

        foreach ($correctAnswers as $questionIndex => $correctAnswer) {
            if (
                !isset($userAnswers[$questionIndex]) ||
                $userAnswers[$questionIndex] != $correctAnswer
            ) {
                return false;
            }
        }

        return true;
    }

    private function evaluateTrueFalse($challenge, $userAnswer)
    {
        $correctAnswer = is_string($challenge->correct_answers)
            ? json_decode($challenge->correct_answers, true)[0]
            : $challenge->correct_answers[0];
        return $userAnswer === $correctAnswer;
    }

    private function evaluateMatching($challenge, $userPairs)
    {
        $correctPairs = is_string($challenge->matching_pairs)
            ? json_decode($challenge->matching_pairs, true)
            : $challenge->matching_pairs;
        $userPairs = is_string($userPairs)
            ? json_decode($userPairs, true)
            : $userPairs;

        if (count($userPairs) !== count($correctPairs)) {
            return false;
        }

        foreach ($correctPairs as $pair) {
            $found = false;
            foreach ($userPairs as $userPair) {
                if (
                    $pair["left"] === $userPair["left"] &&
                    $pair["right"] === $userPair["right"]
                ) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                return false;
            }
        }

        return true;
    }

    public function store(Request $request)
    {
        // Validate incoming data.
        // For MCQ, we auto-generate correct_answers so we do not enforce JSON
        // validation on it.
        $validator = Validator::make($request->all(), [
            "title" => "required|string|max:255",
            "instructions" => "required|string",
            "difficulty" => "required|in:Easy,Medium,Hard",
            "max_score" => "required|integer|min:1",
            "type" => "required|in:practical,mcq,true_false,matching",
            "options" => [
                "nullable",
                function ($attribute, $value, $fail) use ($request) {
                    // Ensure options is either a valid JSON string or an array.
                    $jsonValue = is_string($value) ? $value : json_encode($value);
                    if (
                        $request->type === "mcq" &&
                        !$this->validateMcqOptions($jsonValue)
                    ) {
                        $fail(
                            "Invalid MCQ format. Each question needs a question, an " .
                                "options array, and a correctIndex."
                        );
                    }
                },
            ],
            // For MCQ type, we ignore correct_answers (they will be
            // auto-generated).
            "correct_answers" => $request->type === "mcq" ? "nullable" : "nullable|json",
            "matching_pairs" => "nullable|json",
        ]);

        if ($validator->fails()) {
            return response()->json(["errors" => $validator->errors()], 422);
        }

        try {
            $data = $request->all();

            if ($request->type === "mcq") {
                // Decode the options, whether it was passed as an array or JSON
                // string.
                $options = is_array($request->options)
                    ? $request->options
                    : json_decode($request->options, true);
                $data["options"] = $options;
                // Auto-generate correct_answers from each question's correctIndex.
                $data["correct_answers"] = array_map(function ($question) {
                    return $question["correctIndex"];
                }, $options);
            } else {
                // For other types, set options to null.
                $data["options"] = null;
                if (in_array($request->type, ["true_false"])) {
                    $data["correct_answers"] = $request->correct_answers
                        ? (is_array($request->correct_answers)
                            ? $request->correct_answers
                            : json_decode($request->correct_answers, true))
                        : null;
                } else {
                    $data["correct_answers"] = null;
                }
            }

            if ($request->type === "matching") {
                $data["matching_pairs"] = is_array($request->matching_pairs)
                    ? $request->matching_pairs
                    : json_decode($request->matching_pairs, true);
            } else {
                $data["matching_pairs"] = null;
            }

            $challenge = Challenge::create($data);
            return response()->json($challenge, 201);
        } catch (\Exception $e) {
            Log::error("Challenge creation failed", ["error" => $e->getMessage()]);
            return response()->json(["error" => "Failed to create challenge"], 500);
        }
    }

    /**
     * Admin: Update a challenge
     */
    public function update(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);

        $validator = Validator::make($request->all(), [
            "title" => "sometimes|required|string|max:255",
            "instructions" => "sometimes|required|string",
            "difficulty" => "sometimes|required|in:Easy,Medium,Hard",
            "max_score" => "sometimes|required|integer|min:1",
            "type" => "sometimes|required|in:practical,mcq,true_false,matching",
            "options" => [
                "nullable",
                function ($attribute, $value, $fail) use ($request) {
                    $jsonValue = is_string($value) ? $value : json_encode($value);
                    if (
                        $request->type === "mcq" &&
                        !$this->validateMcqOptions($jsonValue)
                    ) {
                        $fail(
                            "Invalid MCQ format. Each question needs a question, an " .
                                "options array, and a correctIndex."
                        );
                    }
                },
            ],
            "correct_answers" => $request->type === "mcq" ? "nullable" : "nullable|json",
            "matching_pairs" => "nullable|json",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "message" => "Validation failed",
                "errors" => $validator->errors(),
            ], 422);
        }

        try {
            $data = $request->all();

            if ($request->type === "mcq") {
                $options = is_array($request->options)
                    ? $request->options
                    : json_decode($request->options, true);
                $data["options"] = $options;
                $data["correct_answers"] = array_map(function ($question) {
                    return $question["correctIndex"];
                }, $options);
            } else {
                $data["options"] = null;
                if (in_array($request->type, ["true_false"])) {
                    $data["correct_answers"] = $request->correct_answers
                        ? (is_array($request->correct_answers)
                            ? $request->correct_answers
                            : json_decode($request->correct_answers, true))
                        : null;
                } else {
                    $data["correct_answers"] = null;
                }
            }

            if ($request->type === "matching") {
                $data["matching_pairs"] = is_array($request->matching_pairs)
                    ? $request->matching_pairs
                    : json_decode($request->matching_pairs, true);
            } else {
                $data["matching_pairs"] = null;
            }

            $challenge->update($data);
            return response()->json($challenge);
        } catch (\Exception $e) {
            Log::error("Challenge update failed", ["id" => $id, "error" => $e->getMessage()]);
            return response()->json(["message" => "Failed to update challenge"], 500);
        }
    }

    private function validateMcqOptions($options)
    {
        try {
            $decoded = json_decode($options, true);
            if (!is_array($decoded)) {
                return false;
            }
            foreach ($decoded as $question) {
                if (
                    !isset($question["question"]) ||
                    !isset($question["options"]) ||
                    !is_array($question["options"]) ||
                    count($question["options"]) < 2 ||
                    !isset($question["correctIndex"]) ||
                    !is_int($question["correctIndex"]) ||
                    $question["correctIndex"] < 0 ||
                    $question["correctIndex"] >= count($question["options"])
                ) {
                    return false;
                }
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function destroy($id)
    {
        try {
            $challenge = Challenge::findOrFail($id);
            $challenge->delete();
            return response()->json(["message" => "Challenge deleted successfully"]);
        } catch (\Exception $e) {
            Log::error("Challenge deletion failed", ["id" => $id, "error" => $e->getMessage()]);
            return response()->json(["error" => "Failed to delete challenge"], 500);
        }
    }

    public function getAllProgress()
    {
        try {
            $progress = UserProgress::with(["user", "challenge"])
                ->whereNotNull("challenge_id")
                ->orderBy("created_at", "desc")
                ->paginate(20);

            return response()->json($progress);
        } catch (\Exception $e) {
            Log::error("Failed to fetch challenge progress", ["error" => $e->getMessage()]);
            return response()->json(["error" => "Failed to fetch progress"], 500);
        }
    }
}
