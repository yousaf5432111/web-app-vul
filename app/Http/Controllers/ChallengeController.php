<?php
namespace App\Http\Controllers;
use App\Models\Challenge;
use App\Models\UserProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

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
            'payload' => 'required|string',
        ]);
        
        $challenge = Challenge::findOrFail($id);
        $result = false;
        $message = '';
        
        try {
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
            
            $userId = $request->user_id;
        if ($result && $userId) {
            UserProgress::updateOrCreate(
                ['user_id' => $userId, 'challenge_id' => $challenge->id],
                ['completed' => true, 'completed_at' => now(), 'score' => $challenge->max_score]
            );
            
            // Log success
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
        $leaderboard = DB::table('users')
            ->join('user_progress', 'users.id', '=', 'user_progress.user_id')
            ->join('challenges', 'user_progress.challenge_id', '=', 'challenges.id')
            ->where('user_progress.completed', true)
            ->select('users.id', 'users.name', 'users.username',
                     DB::raw('sum(user_progress.score) as total_score'),
                     DB::raw('count(user_progress.id) as challenges_completed'))
            ->groupBy('users.id', 'users.name', 'users.username')
            ->orderBy('total_score', 'desc')
            ->take(10)
            ->get();
            
        return response()->json($leaderboard);
    }
}