<?php

namespace App\Http\Controllers;

use App\Models\UserProgress;
use Illuminate\Http\Request;

class ProgressController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'lesson_id' => 'nullable|exists:lessons,id',
            'challenge_id' => 'nullable|exists:challenges,id',
            'completed' => 'required|boolean',
            'score' => 'nullable|integer',
        ]);
    
        // Check if progress already exists for the given user and challenge
        $existingProgress = UserProgress::where('user_id', $request->user_id)
                                        ->where('challenge_id', $request->challenge_id)
                                        ->first();
    
        if ($existingProgress) {
            return response()->json([
                'message' => 'You have already completed the challenge and did not update the progress with another entry.'
            ], 400);
        }
    
        $progress = UserProgress::create($request->all());
    
        return response()->json(['message' => 'Progress recorded', 'progress' => $progress], 201);
    }

    public function show($userId)
    {
        $progress = UserProgress::where('user_id', $userId)->get();
        return response()->json($progress);
    }
}
