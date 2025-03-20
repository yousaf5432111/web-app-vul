<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lesson;

class LessonSeeder extends Seeder
{
    public function run()
    {
        Lesson::create([
            'title' => 'SQL Injection Basics',
            'content' => 'Learn how SQL Injection can be used to exploit vulnerable applications.',
            'resources' => json_encode([
                [
                    'title' => 'Video 1: Introduction to SQL Injection',
                    'url' => 'https://www.youtube.com/watch?v=example1'
                ],
                [
                    'title' => 'Video 2: SQL Injection Techniques',
                    'url' => 'https://www.youtube.com/watch?v=example2'
                ]
            ]),
        ]);
        Lesson::create([
            'title' => 'Cross-Site Request Forgery (CSRF)',
            'content' => 'Understand CSRF attacks and how to defend against them.',
            'resources' => json_encode([
                [
                    'title' => 'Video 1: Understanding CSRF',
                    'url' => 'https://www.youtube.com/watch?v=example3'
                ],
                [
                    'title' => 'Video 2: Defending Against CSRF',
                    'url' => 'https://www.youtube.com/watch?v=example4'
                ]
            ]),
        ]);
    }
}
