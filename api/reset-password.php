<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::first();
$user->password = Hash::make('password123');
$user->save();

echo "Password updated for: " . $user->email . "\n";
