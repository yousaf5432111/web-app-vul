<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LessonController extends Controller
{
    public function index()
    {
        $lessons = Lesson::all();
        return response()->json($lessons);
    }

    public function show($id)
    {
        $lesson = Lesson::findOrFail($id);
        return response()->json($lesson);
    }
    public function store(Request $request)
    {
    
    $validator = Validator::make($request->all(), [
        'title' => 'required|string|max:255',
        'content' => 'required|string',
        'resources' => 'required|json',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $lesson = Lesson::create($request->all());
    return response()->json($lesson, 201);
}

public function update(Request $request, $id)
{


    
    $lesson = Lesson::findOrFail($id);

    // // Convert resources to JSON if it's not already
    if ($request->has('resources') && !is_string($request->resources)) {
        $request->merge(['resources' => json_encode($request->resources)]);
    }

    $validator = Validator::make($request->all(), [
        'title' => 'sometimes|required|string|max:255',
        'content' => 'sometimes|required|string',
        'resources' => 'sometimes|required|json',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $lesson->update($request->all());
    // return response()->json($lesson);
}


public function destroy($id)
{
    $lesson = Lesson::findOrFail($id);
    $lesson->delete();
    return response()->json(['message' => 'Lesson deleted successfully']);
}
}
