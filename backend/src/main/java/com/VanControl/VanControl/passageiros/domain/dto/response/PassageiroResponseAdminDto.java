package com.VanControl.VanControl.passageiros.domain.dto.response;

import java.util.UUID;

public record PassageiroResponseAdminDto(
        UUID id,
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
