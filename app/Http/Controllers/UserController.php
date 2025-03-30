<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getUserDetails(Request $request)
    {
        $userId = $request->user_id;

        $user = User::find($userId);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]);
    }
    public function updateProfile(Request $request)
{
    $request->validate([
        'user_id' => 'required|exists:users,id',
        'name' => 'required|string|max:255',
        'email' => 'required|email|max:255',
    ]);

    $user = User::find($request->user_id);
    
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }

    // Check if email is already taken by another user
    if ($user->email !== $request->email) {
        $existingUser = User::where('email', $request->email)->where('id', '!=', $user->id)->first();
        if ($existingUser) {
            return response()->json(['error' => 'Email is already taken'], 422);
        }
    }

    $user->name = $request->name;
    $user->email = $request->email;
    $user->save();

    return response()->json([
        'message' => 'Profile updated successfully',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ]
    ]);
}

public function index()
{
    $users = User::paginate(20);
    return response()->json($users);
}

public function show($id)
{
    $user = User::findOrFail($id);
    return response()->json($user);
}

public function delete($id)
{
    if (auth()->id() == $id) {
        return response()->json(['error' => 'You cannot delete your own account'], 400);
    }

    $user = User::findOrFail($id);
    $user->delete();
    return response()->json(['message' => 'User deleted successfully']);
}

}
