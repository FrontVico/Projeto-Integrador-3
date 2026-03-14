package com.VanControl.VanControl.veiculos.domain.entity;

import com.VanControl.VanControl.veiculos.domain.enums.StatusEnum;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Veiculo {

    @Id
    private UUID idVeiculo;

    private String placa;
    private String marca;
    private String modelo;
    private int ano;
    private int capacidade;
    private String renavam;
    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    public Veiculo(String placa, String marca, String modelo, int ano, int capacidade, String renavam) {
        this.placa = placa;
        this.marca = marca;
        this.modelo = modelo;
        this.ano = ano;
        this.capacidade = capacidade;
        this.renavam = renavam;
    }
}
