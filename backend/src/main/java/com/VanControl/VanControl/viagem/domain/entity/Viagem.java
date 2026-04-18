package com.VanControl.VanControl.viagem.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Viagem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String codigoRota;
    private String placaVeiculo;
    private String documentoMotorista;

    private String codigoViagem;

    private String dataViagem;
    private String horarioSaidaPrevisto;
    private String horarioChegadaPrevisto;
    private boolean viagemConcluida;

    public Viagem(String codigoRota, String placaVeiculo, String documentoMotorista, String dataViagem, String horarioSaidaPrevisto, String horarioChegadaPrevisto) {
        this.codigoRota = codigoRota;
        this.placaVeiculo = placaVeiculo;
        this.documentoMotorista = documentoMotorista;
        this.dataViagem = dataViagem;
        this.horarioSaidaPrevisto = horarioSaidaPrevisto;
        this.horarioChegadaPrevisto = horarioChegadaPrevisto;
    }
}
