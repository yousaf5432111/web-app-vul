<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use Illuminate\Http\Request;

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
}
