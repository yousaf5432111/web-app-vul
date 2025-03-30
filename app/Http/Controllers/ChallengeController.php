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
        $allChallenges->each(function($challenge) use ($completedChallenges) {
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
                    // Existing practical challenge logic
                    switch ($challenge->title) {
                        case 'SQL Injection Login Bypass':
                            $result = $this->containsSqlInjection($request->payload);
                            $message = $result ? 'Challenge passed! SQL Injection successful.' : 'Challenge failed. SQL Injection unsuccessful.';
                            break;
                            
                        case 'Simulated CSRF Attack':
                            $result = $this->simulateCsrfAttack($request->payload);
                            $message = $result ? 'Challenge passed! CSRF attack simulated successfully.' : 'Challenge failed. CSRF attack not successful.';
                            break;
                            
                        default:
                            $result = false;
                            $message = 'Unknown challenge type.';
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
                    $message = $result ? 'All matches correct!' : 'Some matches are incorrect. Try again.';
                    break;
                    
                default:
                    $result = false;
                    $message = 'Unknown challenge type.';
                    break;
            }
            
            if ($result && $userId) {
                UserProgress::updateOrCreate(
                    ['user_id' => $userId, 'challenge_id' => $challenge->id],
                    ['completed' => true, 'completed_at' => now(), 'score' => $challenge->max_score]
                );
                
                \Log::info('Challenge completed', [
                    'user_id' => $userId,
                    'challenge_id' => $challenge->id,
                    'challenge_title' => $challenge->title
                ]);
            }
            
        } catch (\Exception $e) {
            Log::error('Challenge evaluation error', [
                'challenge_id' => $challenge->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'result' => false,
                'message' => 'An error occurred while evaluating the challenge.'
            ], 500);
        }
        
        return response()->json([
            'result' => $result,
            'message' => $message,
            'challenge_id' => $challenge->id,
            'score' => $result ? $challenge->max_score : 0
        ], $result ? 200 : 400);
    }
    
    private function containsSqlInjection($input)
    {
        $pattern = '/(\b(SELECT|INSERT|DELETE|UPDATE|DROP|ALTER)\b|\b(OR|AND)\b|\=\=|\-\-|\#|\/\*|\'\s*OR\s*\'.*\'\s*\=\s*\'|\'\s*OR\s*1\s*\=\s*1)/i';
        return preg_match($pattern, $input);
    }
    
    private function simulateCsrfAttack($input)
    {
        $data = json_decode($input, true);
        return !isset($data['csrf_token']) || empty($data['csrf_token']);
    }
    
    public function getByDifficulty($difficulty)
    {
        $challenges = Challenge::where('difficulty', $difficulty)->get();
        return response()->json($challenges);
    }
    
    public function leaderboard()
    {
        try {
            $leaderboard = DB::table('users')
                ->join('user_progress', 'users.id', '=', 'user_progress.user_id')
                ->join('challenges', 'user_progress.challenge_id', '=', 'challenges.id')
                ->where('user_progress.completed', true)
                ->whereNotNull('user_progress.challenge_id')
                ->select(
                    'users.id',
                    'users.name',
                    'users.email',
                    DB::raw('COALESCE(SUM(user_progress.score), 0) as total_score'),
                    DB::raw('COUNT(DISTINCT user_progress.challenge_id) as challenges_completed')
                )
                ->groupBy('users.id', 'users.name', 'users.email')
                ->orderBy('total_score', 'desc')
                ->take(10)
                ->get();
                
            return response()->json($leaderboard);
            
        } catch (\Exception $e) {
            Log::error('Leaderboard error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to load leaderboard',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    
    private function evaluateMcq($challenge, $userAnswer)
    {
        $correctAnswers = json_decode($challenge->correct_answers, true);
        return in_array($userAnswer, $correctAnswers);
    }
    
    private function evaluateTrueFalse($challenge, $userAnswer)
    {
        $correctAnswer = json_decode($challenge->correct_answers, true)[0];
        return $userAnswer === $correctAnswer;
    }
    
    private function evaluateMatching($challenge, $userPairs)
    {
        $correctPairs = json_decode($challenge->matching_pairs, true);
        $userPairs = json_decode($userPairs, true);
        
        if (count($userPairs) !== count($correctPairs)) {
            return false;
        }
        
        foreach ($correctPairs as $pair) {
            $found = false;
            foreach ($userPairs as $userPair) {
                if ($pair['left'] === $userPair['left'] && $pair['right'] === $userPair['right']) {
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
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'instructions' => 'required|string',
            'difficulty' => 'required|in:easy,medium,hard',
            'max_score' => 'required|integer|min:1',
            'type' => 'required|in:practical,mcq,true_false,matching',
            'options' => 'nullable|json',
            'correct_answers' => 'nullable|json',
            'matching_pairs' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $challenge = Challenge::create($request->all());
            return response()->json($challenge, 201);
        } catch (\Exception $e) {
            Log::error('Challenge creation failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create challenge'], 500);
        }
    }

    /**
     * Admin: Update a challenge
     */
    public function update(Request $request, $id)
    {
        $challenge = Challenge::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'instructions' => 'sometimes|required|string',
            'difficulty' => 'sometimes|required|in:easy,medium,hard',
            'max_score' => 'sometimes|required|integer|min:1',
            'type' => 'sometimes|required|in:practical,mcq,true_false,matching',
            'options' => 'nullable|json',
            'correct_answers' => 'nullable|json',
            'matching_pairs' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $challenge->update($request->all());
            return response()->json($challenge);
        } catch (\Exception $e) {
            Log::error('Challenge update failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update challenge'], 500);
        }
    }

    /**
     * Admin: Delete a challenge
     */
    public function destroy($id)
    {
        try {
            $challenge = Challenge::findOrFail($id);
            $challenge->delete();
            return response()->json(['message' => 'Challenge deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Challenge deletion failed', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete challenge'], 500);
        }
    }

    /**
     * Admin: Get all user progress for challenges
     */
    public function getAllProgress()
    {
        try {
            $progress = UserProgress::with(['user', 'challenge'])
                ->whereNotNull('challenge_id')
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json($progress);
        } catch (\Exception $e) {
            Log::error('Failed to fetch challenge progress', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch progress'], 500);
        }
    }

}