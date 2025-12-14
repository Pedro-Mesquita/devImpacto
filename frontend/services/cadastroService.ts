import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uspldqfpbefpjpabpgdw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzcGxkcWZwYmVmcGpwYWJwZ2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODk5MTcsImV4cCI6MjA4MTI2NTkxN30.u91CxIf68MwwsXgExVLlGsXvmv2rKdPNQDZ1VAnBGic';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para gerar UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export type CadastroData = {
  tipo: 'vendedor' | 'cliente';
  nome: string;
  email: string;
  telefone: string;
  cpfCnpj: string;
  senha: string;
  endereco: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  nomeEstabelecimento?: string;
  percentualAlerta?: number;
  percentualDistribuicao?: number;
  percentualCritico?: number;
};

export const cadastroService = {
  async criar(data: CadastroData) {
    try {
      // Gera um UUID único para o cliente
      const clientId = generateUUID();
      
      // 1. Criar usuário no Auth com um ID gerado
      // Gera um email válido para o Auth mesmo que o usuário tenha fornecido um inválido
     
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha || 'temp123456',
      });

      if (authError) {
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      // 2. Inserir dados na tabela clientes com o UUID gerado
      const { error: clienteError } = await supabase
        .from('clientes')
        .insert([
          {
            id: clientId,
            nome: data.nome || 'Cliente',
            email: data.email,
            telefone: data.telefone || '',
            cnpj: data.cpfCnpj ? data.cpfCnpj.substring(0, 15) : null,  // Limita a 15 chars para sobrar espaço
            isvendedor: data.tipo === 'vendedor',
            nome_estabelecimento: data.nomeEstabelecimento || null,
            endereco_rua: data.endereco.rua || '',
            endereco_numero: data.endereco.numero || '',
            endereco_bairro: data.endereco.bairro || '',
            endereco_cidade: data.endereco.cidade || '',
            endereco_estado: data.endereco.estado || '',
          },
        ]);

      if (clienteError) {
        // Rollback do auth se falhar
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (e) {
          // Ignora erro no rollback
        }
        throw new Error(`Erro ao salvar cliente: ${clienteError.message}`);
      }

      // 3. Se for vendedor, atualizar configurações (upsert para evitar conflitos com trigger)
      if (data.tipo === 'vendedor') {
        const { error: configError } = await supabase
          .from('cliente_configuracao')
          .upsert(
            {
              cliente_id: clientId,
              percentual_dias_alerta: data.percentualAlerta || 50,
              percentual_dias_distribuicao: data.percentualDistribuicao || 30,
              percentual_dias_critico: data.percentualCritico || 10,
            },
            { onConflict: 'cliente_id' }
          );

        if (configError) {
          throw new Error(`Erro ao salvar configuração: ${configError.message}`);
        }
      }

      return {
        success: true,
        userId: clientId,
        message: 'Cadastro realizado com sucesso!',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao realizar cadastro',
      };
    }
  },

  async verificarEmailExistente(email: string) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', email)
        .single();

      if (error?.code === 'PGRST116') {
        // Nenhum resultado encontrado
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  },

  async verificarCpfCnpjExistente(cpfCnpj: string) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id')
        .eq('cnpj', cpfCnpj)
        .single();

      if (error?.code === 'PGRST116') {
        // Nenhum resultado encontrado
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Erro ao verificar CPF/CNPJ:', error);
      return false;
    }
  },
};
