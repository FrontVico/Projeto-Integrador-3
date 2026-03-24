package com.VanControl.VanControl.passageiros.domain.entity;

import com.VanControl.VanControl.user.Model.User.User;
import jakarta.persistence.*;
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

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String nome;
    private String cpf;
    private String telefone;
    private String email;
    private String instituicaoEnsino;
    private String turno;
    private String endereco;
    private String cep;

    public Passageiro(String nome, String cpf, String telefone, String email, String intituicaoEnsino, String turno,
                      String endereco, String cep) {
        this.nome = nome;
        this.cpf = cpf;
        this.telefone = telefone;
        this.email = email;
        this.instituicaoEnsino = intituicaoEnsino;
        this.turno = turno;
        this.endereco = endereco;
        this.cep = cep;
    }
}
