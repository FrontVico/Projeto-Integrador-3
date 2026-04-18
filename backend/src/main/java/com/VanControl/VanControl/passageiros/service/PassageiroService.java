package com.VanControl.VanControl.passageiros.service;

import com.VanControl.VanControl.commons.exception.model.ConflictException;
import com.VanControl.VanControl.commons.exception.model.NotFoundException;
import com.VanControl.VanControl.passageiros.domain.dto.request.AtualizarPassageiroRequestDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroDefaultResponseDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroResponseDto;
import com.VanControl.VanControl.passageiros.domain.entity.Passageiro;
import com.VanControl.VanControl.passageiros.mapper.PassageiroMapper;
import com.VanControl.VanControl.passageiros.repository.PassageiroRepository;
import com.VanControl.VanControl.user.DTO.RegisterRequestDTO;
import com.VanControl.VanControl.user.Model.User.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

import static com.VanControl.VanControl.passageiros.mapper.PassageiroMapper.converterParaPassageiro;

@Service
@RequiredArgsConstructor
public class PassageiroService {

    private final PassageiroRepository passageiroRepository;

    public void cadastrarPassageiro(RegisterRequestDTO dto, User user) {
        if(passageiroRepository.findByCpf(dto.cpf()) != null){
            throw new ConflictException("Passageiro já cadastrado");
        }
        var passageiro = converterParaPassageiro(dto);
        passageiro.setUser(user);
        passageiroRepository.save(passageiro);
    }

    public PassageiroResponseDto buscarPassageiroPorCpf(String cpf) {
        var passageiro = buscarPassageiroPorCpfInterno(cpf);
        verificarPermissaoAcesso(passageiro);
        return PassageiroMapper.converterParaPassageiroResponseDto(passageiro);
    }

    public List<PassageiroResponseDto> listarPassageiros() {
        return passageiroRepository.findAll()
                .stream()
                .map(PassageiroMapper::converterParaPassageiroResponseDto)
                .toList();
    }

    public PassageiroResponseDto atualizarPassageiro(String cpf, AtualizarPassageiroRequestDto dto) {
        var passageiro = buscarPassageiroPorCpfInterno(cpf);

        verificarPermissaoAcesso(passageiro);

        if (dto.nome() != null) passageiro.setNome(dto.nome());
        if (dto.telefone() != null) passageiro.setTelefone(dto.telefone());
        if (dto.email() != null) {
            passageiro.setEmail(dto.email());
            if (passageiro.getUser() != null) {
                passageiro.getUser().setEmail(dto.email());
            }
        }
        if (dto.intituicaoEnsino() != null) passageiro.setInstituicaoEnsino(dto.intituicaoEnsino());
        if (dto.turno() != null) passageiro.setTurno(dto.turno());
        if (dto.Endereco() != null) passageiro.setEndereco(dto.Endereco());
        if (dto.cep() != null) passageiro.setCep(dto.cep());

        var passageiroAtualizado = passageiroRepository.save(passageiro);

        return PassageiroMapper.converterParaPassageiroResponseDto(passageiroAtualizado);
    }

    @Transactional
    public PassageiroDefaultResponseDto deletarPassageiro(String cpf) {
        var passageiro = buscarPassageiroPorCpfInterno(cpf);

        verificarPermissaoAcesso(passageiro);

        passageiroRepository.delete(passageiro);
        return new PassageiroDefaultResponseDto("Passageiro deletado com sucesso");
    }

    private void verificarPermissaoAcesso(Passageiro passageiro) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        var usuarioLogado = (User) auth.getPrincipal();

        boolean hasAdminRole = auth.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));

        if(!hasAdminRole && !Objects.equals(usuarioLogado.getEmail(), passageiro.getEmail())) {
            throw new AccessDeniedException("Acesso negado");
        }
    }

    private Passageiro buscarPassageiroPorCpfInterno(String cpf) {
        var passageiro = passageiroRepository.findByCpf(cpf);
        if(passageiro == null){
            throw new NotFoundException("Passageiro não encontrado");
        }
        return passageiro;
    }
}
