<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserProgress;

class UserProgressSeeder extends Seeder
{
    public function run()
    {
        UserProgress::create([
            'user_id' => 1,
            'lesson_id' => 1,
            'challenge_id' => 1,
            'completed' => false,
            'score' => null,
        ]);
    }
}
