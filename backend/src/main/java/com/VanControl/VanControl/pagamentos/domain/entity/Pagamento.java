package com.VanControl.VanControl.pagamentos.domain.entity;

import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import com.VanControl.VanControl.veiculos.domain.enums.StatusEnum;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "passageiro_id")
    private Passageiro passageiro;

    private String competencia;
    private BigDecimal valor;
    private LocalDate dataVencimento;
    private LocalDate dataPagamento;

    @Enumerated(EnumType.STRING)
    private StatusEnum status;



}
