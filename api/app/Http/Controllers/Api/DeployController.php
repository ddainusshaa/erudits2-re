<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

class DeployController extends Controller
{
    public function handle(Request $request)
    {
        Log::info('GitHub webhook received.');
        $secret = config('services.github.webhook_secret');

        $signature = 'sha256=' . hash_hmac('sha256', $request->getContent(), $secret);

         if (!hash_equals($signature, $request->header('X-Hub-Signature-256'))) {
            Log::info('Unauthorized webhook attempt');
            abort(403, 'Unauthorized');
         }

         $payload = json_decode($request->getContent(), true);

        // Filter out tag push
        if (isset($payload['ref']) && str_starts_with($payload['ref'], 'refs/tags/')) {
            Log::info('Tag push detected. Skipping deploy.');
            return response()->json(['message' => 'Tag push ignored']);
        }

        exec('/var/www/erudits2/deploy.sh >> /var/log/deploy.log 2>&1 &');

        return response()->json(['message' => 'Deployment started']);
    }
}
