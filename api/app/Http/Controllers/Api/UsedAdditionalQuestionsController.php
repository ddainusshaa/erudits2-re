<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsedAdditionalQuestions;
use Illuminate\Http\Request;

class UsedAdditionalQuestionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(string $instanceId)
    {
        return UsedAdditionalQuestions::where('game_instance_id', $instanceId)->get();
    }

}
