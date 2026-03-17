package com.VanControl.VanControl.motorista.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.time.YearMonth;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Motorista {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nome;
    private String cnh;
    private String categoriaCnh;
    private YearMonth dataValidadeCnh;
    private String cpf;
    private String telefone;

    public Motorista(String nome, String cnh, String categoriaCnh, YearMonth dataValidadeCnh, String cpf, String telefone) {
        this.nome = nome;
        this.cnh = cnh;
        this.categoriaCnh = categoriaCnh;
        this.dataValidadeCnh = dataValidadeCnh;
        this.cpf = cpf;
        this.telefone = telefone;
    }
}
