package com.VanControl.VanControl.passageiros.controller;

import com.VanControl.VanControl.commons.util.SecurityUtils;
import com.VanControl.VanControl.passageiros.domain.dto.request.AtualizarPassageiroRequestDto;
import com.VanControl.VanControl.passageiros.domain.dto.response.PassageiroResponseDto;
import com.VanControl.VanControl.passageiros.mapper.PassageiroMapper;
import com.VanControl.VanControl.passageiros.service.PassageiroService;
import com.VanControl.VanControl.user.Infra.Security.TokenService;
import com.VanControl.VanControl.user.Repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PassageiroController.class)
@DisplayName("PassageiroController - Testes de validação de acesso por CPF")
@Import(PassageiroMapper.class)
class PassageiroControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TokenService tokenService;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private PassageiroService passageiroService;

    @MockitoBean
    private SecurityUtils securityUtils;

    private PassageiroResponseDto passageiroResponseDto;
    private AtualizarPassageiroRequestDto atualizarPassageiroRequestDto;

    private static final String CPF_PASSAGEIRO = "12345678901";
    private static final String CPF_OUTRO_PASSAGEIRO = "98765432100";
    private static final String CPF_ADMIN = "99999999999";
    private static final String CPF_MOTORISTA = "88888888888";

    @BeforeEach
    void setUp() {
        passageiroResponseDto = new PassageiroResponseDto(
                "João Silva",
                CPF_PASSAGEIRO,
                "11111-1111",
                "joao@email.com",
                "UFSC",
                "Manhã",
                "Rua A, 123",
                "88000-000"
        );

        atualizarPassageiroRequestDto = new AtualizarPassageiroRequestDto(
                "João Silva Atualizado",
                "22222-2222",
                "joao.novo@email.com",
                "UFSC",
                "Tarde",
                "Rua B, 456",
                "88000-001"
        );
    }

    @Test
    @DisplayName("Deve buscar passageiro por CPF quando PASSAGEIRO acessa seus próprios dados")
    @WithMockUser(username = CPF_PASSAGEIRO, roles = "PASSAGEIRO")
    void deveBuscarPassageiroPorCpfQuandoPassageiroAcessaProprioDados() throws Exception {
        doNothing().when(securityUtils).validateCpfAccess(CPF_PASSAGEIRO);
        when(passageiroService.buscarPassageiroPorCpf(CPF_PASSAGEIRO)).thenReturn(passageiroResponseDto);

        mockMvc.perform(get("/passageiros/{cpf}", CPF_PASSAGEIRO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value(CPF_PASSAGEIRO))
                .andExpect(jsonPath("$.nome").value("João Silva"));

        verify(securityUtils, times(1)).validateCpfAccess(CPF_PASSAGEIRO);
        verify(passageiroService, times(1)).buscarPassageiroPorCpf(CPF_PASSAGEIRO);
    }

    @Test
    @DisplayName("Deve bloquear PASSAGEIRO de buscar dados de outro passageiro")
    @WithMockUser(username = CPF_PASSAGEIRO, roles = "PASSAGEIRO")
    void deveBloquerPassageiroDeBuscarDadosDeOutro() throws Exception {
        doThrow(new AccessDeniedException("Você não tem permissão para acessar dados de outro usuário"))
                .when(securityUtils).validateCpfAccess(CPF_OUTRO_PASSAGEIRO);

        mockMvc.perform(get("/passageiros/{cpf}", CPF_OUTRO_PASSAGEIRO))
                .andExpect(status().isForbidden());

        verify(securityUtils, times(1)).validateCpfAccess(CPF_OUTRO_PASSAGEIRO);
        verify(passageiroService, never()).buscarPassageiroPorCpf(any());
    }

    @Test
    @DisplayName("Deve permitir ADMIN buscar passageiro por qualquer CPF")
    @WithMockUser(username = CPF_ADMIN, roles = "ADMIN")
    void devePermitirAdminBuscarPassageiroPorQualquerCpf() throws Exception {
        doNothing().when(securityUtils).validateCpfAccess(CPF_PASSAGEIRO);
        when(passageiroService.buscarPassageiroPorCpf(CPF_PASSAGEIRO)).thenReturn(passageiroResponseDto);

        mockMvc.perform(get("/passageiros/{cpf}", CPF_PASSAGEIRO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value(CPF_PASSAGEIRO));

        verify(securityUtils, times(1)).validateCpfAccess(CPF_PASSAGEIRO);
        verify(passageiroService, times(1)).buscarPassageiroPorCpf(CPF_PASSAGEIRO);
    }

    @Test
    @DisplayName("Deve permitir MOTORISTA buscar passageiro por qualquer CPF")
    @WithMockUser(username = CPF_MOTORISTA, roles = "MOTORISTA")
    void devePermitirMotoristaBuscarPassageiroPorQualquerCpf() throws Exception {
        doNothing().when(securityUtils).validateCpfAccess(CPF_PASSAGEIRO);
        when(passageiroService.buscarPassageiroPorCpf(CPF_PASSAGEIRO)).thenReturn(passageiroResponseDto);

        mockMvc.perform(get("/passageiros/{cpf}", CPF_PASSAGEIRO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value(CPF_PASSAGEIRO));

        verify(securityUtils, times(1)).validateCpfAccess(CPF_PASSAGEIRO);
        verify(passageiroService, times(1)).buscarPassageiroPorCpf(CPF_PASSAGEIRO);
    }

    @Test
    @DisplayName("Deve atualizar passageiro quando PASSAGEIRO atualiza seus próprios dados")
    @WithMockUser(username = CPF_PASSAGEIRO, roles = "PASSAGEIRO")
    void deveAtualizarPassageiroQuandoPassageiroAtualizaProprioDados() throws Exception {
        doNothing().when(securityUtils).validateCpfAccess(CPF_PASSAGEIRO);
        when(passageiroService.atualizarPassageiro(eq(CPF_PASSAGEIRO), any(AtualizarPassageiroRequestDto.class)))
                .thenReturn(passageiroResponseDto);

        mockMvc.perform(put("/passageiros/{cpf}", CPF_PASSAGEIRO)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(atualizarPassageiroRequestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value(CPF_PASSAGEIRO));

        verify(securityUtils, times(1)).validateCpfAccess(CPF_PASSAGEIRO);
        verify(passageiroService, times(1)).atualizarPassageiro(eq(CPF_PASSAGEIRO), any(AtualizarPassageiroRequestDto.class));
    }

    @Test
    @DisplayName("Deve bloquear PASSAGEIRO de atualizar dados de outro passageiro")
    @WithMockUser(username = CPF_PASSAGEIRO, roles = "PASSAGEIRO")
    void deveBloquerPassageiroDeAtualizarDadosDeOutro() throws Exception {
        doThrow(new AccessDeniedException("Você não tem permissão para acessar dados de outro usuário"))
                .when(securityUtils).validateCpfAccess(CPF_OUTRO_PASSAGEIRO);

        mockMvc.perform(put("/passageiros/{cpf}", CPF_OUTRO_PASSAGEIRO)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(atualizarPassageiroRequestDto)))
                .andExpect(status().isForbidden());

        verify(securityUtils, times(1)).validateCpfAccess(CPF_OUTRO_PASSAGEIRO);
        verify(passageiroService, never()).atualizarPassageiro(any(), any());
    }

    @Test
    @DisplayName("Deve permitir ADMIN atualizar dados de qualquer passageiro")
    @WithMockUser(username = CPF_ADMIN, roles = "ADMIN")
    void devePermitirAdminAtualizarQualquerPassageiro() throws Exception {
        doNothing().when(securityUtils).validateCpfAccess(CPF_PASSAGEIRO);
        when(passageiroService.atualizarPassageiro(eq(CPF_PASSAGEIRO), any(AtualizarPassageiroRequestDto.class)))
                .thenReturn(passageiroResponseDto);

        mockMvc.perform(put("/passageiros/{cpf}", CPF_PASSAGEIRO)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(atualizarPassageiroRequestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value(CPF_PASSAGEIRO));

        verify(securityUtils, times(1)).validateCpfAccess(CPF_PASSAGEIRO);
        verify(passageiroService, times(1)).atualizarPassageiro(eq(CPF_PASSAGEIRO), any(AtualizarPassageiroRequestDto.class));
    }
}