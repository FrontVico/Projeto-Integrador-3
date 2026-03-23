package com.VanControl.VanControl.passageiros.domain.dto.response;

public record PassageiroResponseDto(
        String nome,
        String cpf,
        String telefone,
        String email,
        String intituicaoEnsino,
        String turno,
        String endereco,
        String cep
) {
}
