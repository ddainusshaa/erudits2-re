<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlayerRequest extends FormRequest
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
            'instance_id' => 'required|string',
            'player_name' => 'required|string|max:16',
        ];
    }

    public function messages(): array
    {
        return [
            'player_name.required' => 'Player name is required.',
            'player_name.max' => 'Player name is too long.',
        ];
    }
}
