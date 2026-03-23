package com.VanControl.VanControl.passageiros.domain.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Passageiro {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nome;
    private String cpf;
    private String telefone;
    private String email;
    private String intituicaoEnsino;
    private String turno;
    private String Endereco;
    private String cep;

    public Passageiro(String nome, String cpf, String telefone, String email, String intituicaoEnsino, String turno,
                      String endereco, String cep) {
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
        this.email = email;
        this.intituicaoEnsino = intituicaoEnsino;
        this.turno = turno;
        Endereco = endereco;
        this.cep = cep;
    }
}
