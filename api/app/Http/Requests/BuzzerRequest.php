<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BuzzerRequest extends FormRequest
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
            'instance_id' => 'required|uuid',
            'player_id' => 'required|uuid',
            'buzzed_at' => 'required',
        ];
    }
}
