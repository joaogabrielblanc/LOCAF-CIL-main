const ClientRepository = require('../repositories/ClientRepository');

class ClientController {

    static async buscarPedidos(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status || null;
            const ordem = req.query.ordem || req.query.order || 'asc';

            if (page < 1 || limit < 1) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'page e limit devem ser maiores que zero'
                });
            }

            const pedidos = await ClientRepository.buscarPedidos(page, limit, status, ordem);

            const total = pedidos.length > 0
                ? parseInt(pedidos[0].total_registros)
                : 0;

            const totalPaginas = Math.ceil(total / limit);

            res.json({
                sucesso: true,
                pagina: page,
                limite: limit,
                total: total,
                totalPaginas: totalPaginas,
                filtroStatus: status || 'todos',
                ordem: ordem,
                dados: pedidos
            });

        } catch (error) {
            console.error('[ERRO BUSCAR PEDIDOS]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar pedidos no banco de dados'
            });
        }
    }

    static async buscarClientes(req, res) {
        try {
            const clientes = await ClientRepository.buscarClientes();
            res.json({
                sucesso: true,
                total: clientes.length,
                dados: clientes
            });
        } catch (error) {
            console.error('[ERRO BUSCAR CLIENTES]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar clientes no banco de dados'
            });
        }
    }

    static async buscarCacambas(req, res) {
        try {
            const cacambas = await ClientRepository.buscarCacambas();
            res.json({
                sucesso: true,
                total: cacambas.length,
                dados: cacambas
            });
        } catch (error) {
            console.error('[ERRO BUSCAR CACAMBAS]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar caçambas no banco de dados'
            });
        }
    }

    static async buscarAfiliados(req, res) {
        try {
            const afiliados = await ClientRepository.buscarAfiliados();
            res.json({
                sucesso: true,
                total: afiliados.length,
                dados: afiliados
            });
        } catch (error) {
            console.error('[ERRO BUSCAR AFILIADOS]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar afiliados no banco de dados'
            });
        }
    }

    static async buscarEstatisticas(req, res) {
        try {
            const estatisticas = await ClientRepository.buscarEstatisticas();
            res.json({
                sucesso: true,
                dados: estatisticas
            });
        } catch (error) {
            console.error('[ERRO BUSCAR ESTATISTICAS]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar estatísticas no banco de dados'
            });
        }
    }

    static async buscarPedidoPorId(req, res) {
        try {
            const { id } = req.params;
            const pedido = await ClientRepository.buscarPedidoPorId(id);

            if (!pedido) {
                return res.status(404).json({
                    sucesso: false,
                    erro: `Pedido com ID ${id} não encontrado no banco.`
                });
            }

            res.json({
                sucesso: true,
                dado: pedido
            });
        } catch (error) {
            console.error('[ERRO BUSCAR PEDIDO POR ID]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar pedido por ID'
            });
        }
    }

    static async buscarClientePorId(req, res) {
        try {
            const { id } = req.params;
            const cliente = await ClientRepository.buscarClientePorId(id);

            if (!cliente) {
                return res.status(404).json({
                    sucesso: false,
                    erro: `Cliente com ID ${id} não encontrado no banco.`
                });
            }

            res.json({
                sucesso: true,
                dado: cliente
            });
        } catch (error) {
            console.error('[ERRO BUSCAR CLIENTE POR ID]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar cliente por ID'
            });
        }
    }

    static async buscarCacambaPorId(req, res) {
        try {
            const { id } = req.params;
            const cacamba = await ClientRepository.buscarCacambaPorId(id);

            if (!cacamba) {
                return res.status(404).json({
                    sucesso: false,
                    erro: `Caçamba com ID ${id} não encontrada no banco.`
                });
            }

            res.json({
                sucesso: true,
                dado: cacamba
            });
        } catch (error) {
            console.error('[ERRO BUSCAR CACAMBA POR ID]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar caçamba por ID'
            });
        }
    }

    static async buscarAfiliadoPorId(req, res) {
        try {
            const { id } = req.params;
            const afiliado = await ClientRepository.buscarAfiliadoPorId(id);

            if (!afiliado) {
                return res.status(404).json({
                    sucesso: false,
                    erro: `Afiliado com ID ${id} não encontrado no banco.`
                });
            }

            res.json({
                sucesso: true,
                dado: afiliado
            });
        } catch (error) {
            console.error('[ERRO BUSCAR AFILIADO POR ID]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao buscar afiliado por ID'
            });
        }
    }

    static async criarCacamba(req, res) {
        try {
            const { nome, preco } = req.body;
            if (!nome || preco === undefined || preco === null) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome e preço são obrigatórios para cadastrar caçamba'
                });
            }

            const nova = await ClientRepository.criarCacamba(req.body);
            res.status(201).json({
                sucesso: true,
                mensagem: 'Caçamba cadastrada com sucesso no banco de dados Neon!',
                dado: nova,
                cacamba: nova
            });
        } catch (error) {
            console.error('[ERRO CRIAR CACAMBA]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao cadastrar caçamba no banco de dados'
            });
        }
    }

    static async criarPedido(req, res) {
        try {
            const novo = await ClientRepository.criarPedido(req.body);
            res.status(201).json({
                sucesso: true,
                mensagem: 'Pedido criado com sucesso no banco de dados Neon!',
                dado: novo,
                pedido: novo
            });
        } catch (error) {
            console.error('[ERRO CRIAR PEDIDO]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao criar pedido no banco de dados'
            });
        }
    }

    static async criarAfiliado(req, res) {
        try {
            const { empresa } = req.body;
            if (!empresa) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome da empresa é obrigatório'
                });
            }

            const novo = await ClientRepository.criarAfiliado(req.body);
            res.status(201).json({
                sucesso: true,
                mensagem: 'Empresa cadastrada com sucesso no banco de dados Neon!',
                dado: novo,
                afiliado: novo
            });
        } catch (error) {
            console.error('[ERRO CRIAR AFILIADO]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao cadastrar empresa no banco de dados'
            });
        }
    }

    static async criarCliente(req, res) {
        try {
            const { nome, email } = req.body;
            if (!nome || !email) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'Nome e e-mail são obrigatórios'
                });
            }

            const novo = await ClientRepository.criarCliente(req.body);
            res.status(201).json({
                sucesso: true,
                mensagem: 'Cliente cadastrado com sucesso no banco de dados Neon!',
                dado: novo,
                cliente: novo
            });
        } catch (error) {
            console.error('[ERRO CRIAR CLIENTE]', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro ao cadastrar cliente no banco de dados'
            });
        }
    }
}

module.exports = ClientController;