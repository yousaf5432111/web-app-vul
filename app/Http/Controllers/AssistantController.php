<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Gemini\Laravel\Facades\Gemini;

class AssistantController extends Controller
{
    private $preferredModels = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.0-pro'
    ];

    public function ask(Request $request)
    {
        try {
            $validated = $request->validate([
                'question' => 'required|string|max:1000',
                'context' => 'nullable|array',
                'context.page' => 'sometimes|string',
                'context.pageTitle' => 'sometimes|string',
                'context.timestamp' => 'sometimes|string'
            ]);

            $question = $this->sanitizeInput($validated['question']);
            $context = $validated['context'] ?? null;
            $prompt = $this->buildStrictPrompt($question, $context);

            // Try preferred models in order
            foreach ($this->preferredModels as $model) {
                try {
                    $response = Gemini::model($model)->generateContent($prompt);
                    $answer = $response->text();
                    
                    if (!empty(trim($answer))) {
                        return response()->json(['answer' => $answer]);
                    }
                } catch (\Exception $e) {
                    Log::info("Model {$model} failed: " . $e->getMessage());
                    continue;
                }
            }

            // If all preferred models failed, try the default
            try {
                $response = Gemini::generateContent($prompt);
                $answer = $response->text();
                
                if (empty(trim($answer))) {
                    throw new \Exception("Empty response from default model");
                }
                
                return response()->json(['answer' => $answer]);
            } catch (\Exception $e) {
                Log::error('All model attempts failed: ' . $e->getMessage());
                throw new \Exception("All model attempts failed");
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Invalid input',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Gemini error: '.$e->getMessage());
            return response()->json([
                'error' => 'Assistant unavailable.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    private function sanitizeInput(string $input): string
    {
        $cleaned = preg_replace('/[^a-zA-Z0-9\s\?\.\,\!\-\_\@\#\$\&\*\(\)]/', '', $input);
        return trim($cleaned);
    }

    private function buildStrictPrompt(string $question, ?array $context = null): string
    {
        $contextBlock = '';
        
        if ($context) {
            $contextBlock = "\n\nContext:\n";
            $contextBlock .= "Current Page: " . ($context['page'] ?? 'N/A') . "\n";
            $contextBlock .= "Page Title: " . ($context['pageTitle'] ?? 'N/A') . "\n";
            $contextBlock .= "Time: " . ($context['timestamp'] ?? 'N/A') . "\n";
        }

        return <<<PROMPT
You are a strict cybersecurity assistant. Your responses MUST follow these rules:

1. ONLY answer cybersecurity questions (web security, ethical hacking, penetration testing)
2. NEVER provide:
   - Direct attack payloads
   - Step-by-step exploit instructions
   - Specific vulnerability details for real systems
3. For demonstration queries (e.g., "how to demo SQL injection"):
   - Explain the concept theoretically
   - Suggest general testing approaches
   - Recommend safe practice environments
4. For illegal/dangerous queries:
   - Respond: "I cannot assist with that for ethical and legal reasons"
5. Keep answers concise (1-3 paragraphs max)
6. Always remind users to:
   - Get proper authorization
   - Use test environments
   - Follow responsible disclosure
7. Consider the user's current page context when relevant

{$contextBlock}

Question: {$question}
PROMPT;
    }
}
