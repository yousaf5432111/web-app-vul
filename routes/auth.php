<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\ChallengeController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;


    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    
    
        Route::get('/sanctum/csrf-cookie', function () {
            return response()->json(['message' => 'CSRF token set']);
        });


        // Lesson routes
Route::get('/lessons', [LessonController::class, 'index']);
Route::get('/lessons/{id}', [LessonController::class, 'show']);

// Challenge routes
Route::get('/challenges', [ChallengeController::class, 'index']);
Route::get('/challenges/{id}', [ChallengeController::class, 'show']);
Route::post('/challenges/{id}/evaluate', [ChallengeController::class, 'evaluate']);

// Progress routes
Route::post('/progress', [ProgressController::class, 'store']);
Route::get('/progress/{userId}', [ProgressController::class, 'show']);

Route::get('/test', function () {
    return response()->json(['message' => 'API is working']);
});

Route::post('/challenges/sql-injection-demo', [ChallengeController::class, 'sqlInjectionDemo']);
Route::post('/challenges/csrf-demo', [ChallengeController::class, 'csrfDemo']);

Route::post('/challenges/{id}/evaluate', [ChallengeController::class, 'evaluate']);


Route::get('/user-details', [UserController::class, 'getUserDetails']);
Route::post('/update-profile', [UserController::class, 'updateProfile']);



Route::post('/feedback/test', [FeedbackController::class, 'test']);
Route::post('/feedback', [FeedbackController::class, 'store']);
Route::get('/feedback', [FeedbackController::class, 'index']);
Route::get('/feedback/{id}', [FeedbackController::class, 'show']);
Route::put('/feedback/{id}', [FeedbackController::class, 'update']);
Route::delete('/feedback/{id}', [FeedbackController::class, 'destroy']);
Route::get('/feedback/export/csv', [FeedbackController::class, 'exportCsv']);
Route::get('/feedback/stats', [FeedbackController::class, 'getStats']);