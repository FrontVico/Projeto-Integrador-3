package com.VanControl.VanControl.veiculos.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CadastrarVeiculoRequestDto(
        @NotBlank(message = "Insira a Placa do Veicullo")
        String placa,
        @NotBlank(message = "Insira a marca do veiculo")
        String marca,
        String modelo,
        int ano,
        int capacidade,
        String renavam



) {
}
