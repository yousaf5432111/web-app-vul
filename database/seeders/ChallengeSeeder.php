<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Challenge;

class ChallengeSeeder extends Seeder
{
    public function run()
    {
        Challenge::create([
            'title' => 'SQL Injection Login Bypass',
            'instructions' => 'Try to bypass the login by using SQL Injection.',
            'difficulty' => 'Medium',
            'max_score' => 100,
        ]);

        Challenge::create([
            'title' => 'Simulated CSRF Attack',
            'instructions' => 'Submit a forged request and observe the application’s behavior.',
            'difficulty' => 'Easy',
            'max_score' => 50,
        ]);
    }
}
