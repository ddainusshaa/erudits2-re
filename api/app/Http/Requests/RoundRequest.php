<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoundRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'id' => 'required|string',
            'title' => 'required|string',
            'disqualify_amount' => 'required|integer',
            'answer_time' => 'required|integer',
            'points' => 'required|integer',
            'is_additional' => 'boolean|nullable',
            'game_id' => 'required|string',
            'is_test' => 'boolean|nullable',
        ];
    }
}
