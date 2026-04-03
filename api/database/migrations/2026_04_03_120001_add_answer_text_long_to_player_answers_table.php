<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('player_answers', function (Blueprint $table) {
            $table->text('answer_text_long')->nullable()->after('answer_text');
        });
    }

    public function down(): void
    {
        Schema::table('player_answers', function (Blueprint $table) {
            $table->dropColumn('answer_text_long');
        });
    }
};
