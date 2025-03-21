<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\QueryException;

class FeedbackController extends Controller
{
    /**
     * Test endpoint to verify API connectivity
     */
    public function test(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Feedback API test endpoint working',
            'received' => $request->all(),
            'timestamp' => now()->toDateTimeString()
        ]);
    }

    /**
     * Display a listing of feedback entries
     */
    public function index()
    {
        try {
            $feedback = Feedback::latest()->paginate(15);
            return response()->json($feedback);
        } catch (\Exception $e) {
            Log::error('Error fetching feedback list: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve feedback list'
            ], 500);
        }
    }

    /**
     * Show the form for creating a new feedback entry
     */
    public function create()
    {
        return view('feedback.create');
    }

    /**
     * Store a newly created feedback entry
     */
    public function store(Request $request)
    {
        Log::info('Feedback submission received', $request->all());

        try {
            // Validate request data
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|numeric',
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'subject' => 'required|string|max:255',
                'message' => 'required|string',
                'rating' => 'nullable|numeric|min:1|max:5',
            ]);

            if ($validator->fails()) {
                Log::warning('Feedback validation failed', ['errors' => $validator->errors()->toArray()]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Create new feedback
            $feedback = new Feedback();
            $feedback->user_id = $request->user_id;
            $feedback->name = $request->name;
            $feedback->email = $request->email;
            $feedback->subject = $request->subject;
            $feedback->message = $request->message;
            $feedback->rating = $request->rating ?? null;
            $feedback->is_resolved = false;
            $feedback->save();

            Log::info('Feedback created successfully', ['id' => $feedback->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Thank you for your feedback!',
                'feedback_id' => $feedback->id
            ], 201);
        } catch (QueryException $e) {
            Log::error('Database error creating feedback: ' . $e->getMessage(), [
                'code' => $e->getCode(),
                'sql' => $e->getSql() ?? 'N/A'
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Database error while saving feedback. Please try again later.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error creating feedback: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'An unexpected error occurred while processing your feedback.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Success page after submitting feedback
     */
    public function success()
    {
        return view('feedback.success');
    }

    /**
     * Display the specified feedback entry
     */
    public function show($id)
    {
        try {
            $feedback = Feedback::findOrFail($id);
            return response()->json($feedback);
        } catch (\Exception $e) {
            Log::error('Error retrieving feedback: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Feedback not found'
            ], 404);
        }
    }

    /**
     * Show the form for editing feedback
     */
    public function edit($id)
    {
        try {
            $feedback = Feedback::findOrFail($id);
            return view('admin.feedback.edit', compact('feedback'));
        } catch (\Exception $e) {
            Log::error('Error retrieving feedback for editing: ' . $e->getMessage());
            return redirect()->route('admin.feedback.index')
                ->with('error', 'Feedback not found');
        }
    }

    /**
     * Update the specified feedback in storage
     */
    public function update(Request $request, $id)
    {
        try {
            $feedback = Feedback::findOrFail($id);
            
            $validated = $request->validate([
                'admin_notes' => 'nullable|string',
                'is_resolved' => 'boolean',
            ]);

            $feedback->update($validated);
            
            Log::info('Feedback updated', ['id' => $feedback->id]);

            return response()->json([
                'status' => 'success',
                'message' => 'Feedback updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating feedback: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update feedback'
            ], 500);
        }
    }

    /**
     * Remove the specified feedback from storage
     */
    public function destroy($id)
    {
        try {
            $feedback = Feedback::findOrFail($id);
            $feedback->delete();
            
            Log::info('Feedback deleted', ['id' => $id]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Feedback deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting feedback: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete feedback'
            ], 500);
        }
    }

    /**
     * Export feedback data to CSV
     */
    public function exportCsv()
    {
        try {
            $filename = 'feedback-export-' . date('Y-m-d') . '.csv';
            $feedback = Feedback::all();

            $headers = [
                "Content-type" => "text/csv",
                "Content-Disposition" => "attachment; filename=$filename",
                "Pragma" => "no-cache",
                "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
                "Expires" => "0"
            ];

            $columns = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Rating', 'Resolved', 'Created At'];

            $callback = function() use ($feedback, $columns) {
                $file = fopen('php://output', 'w');
                fputcsv($file, $columns);

                foreach ($feedback as $item) {
                    fputcsv($file, [
                        $item->id,
                        $item->name,
                        $item->email,
                        $item->subject,
                        $item->message,
                        $item->rating,
                        $item->is_resolved ? 'Yes' : 'No',
                        $item->created_at->format('Y-m-d H:i:s')
                    ]);
                }
                fclose($file);
            };
            
            Log::info('Feedback exported to CSV');
            
            return response()->stream($callback, 200, $headers);
        } catch (\Exception $e) {
            Log::error('Error exporting feedback: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to export feedback'
            ], 500);
        }
    }
    
    /**
     * Get feedback statistics
     */
    public function getStats()
    {
        try {
            $stats = [
                'total' => Feedback::count(),
                'resolved' => Feedback::where('is_resolved', true)->count(),
                'unresolved' => Feedback::where('is_resolved', false)->count(),
                'average_rating' => Feedback::whereNotNull('rating')->avg('rating') ?? 0
            ];
            
            return response()->json([
                'status' => 'success',
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting feedback stats: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve feedback statistics'
            ], 500);
        }
    }
}
