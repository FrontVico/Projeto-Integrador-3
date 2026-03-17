package com.VanControl.VanControl.motorista.domain.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.br.CPF;

public record AtualizarMotoristaRequestDto(
        @CPF(message = "CPF inválido")
        @NotNull(message = "Insira o CPF do motorista")
        String cpf,
        @Pattern(regexp = "^[0-9]{5}-[0-9]{4}$", message = "Insira o telefone no formato 12345-6789")
        @NotNull(message = "Insira o telefone do motorista")
        String telefone
) {
}
