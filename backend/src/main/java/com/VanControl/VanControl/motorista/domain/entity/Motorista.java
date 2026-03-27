package com.VanControl.VanControl.motorista.domain.entity;

import jakarta.persistence.*;
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

    @Column(unique = true)
    private String cnh;
    private String categoriaCnh;
    private YearMonth dataValidadeCnh;
    @Column(unique = true)
    private String cpf;
    @Column(unique = true)
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
