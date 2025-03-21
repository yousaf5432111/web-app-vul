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

        $progress = UserProgress::create($request->all());
        return response()->json(['message' => 'Progress recorded', 'progress' => $progress], 201);
    }

    public function show($userId)
    {
        $progress = UserProgress::where('user_id', $userId)->get();
        return response()->json($progress);
    }
}
