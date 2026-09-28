const pool = require('../database/connection');

class ClientRepository {

    static async buscarPedidos(page, limit, status = null, ordem = 'asc') {
        const offset = (page - 1) * limit;
        const params = [limit, offset];
        let statusFilter = '';

        if (status && status !== 'todos') {
            params.push(status);
            statusFilter = 'WHERE p.status = $3';
        }

        const direcao = String(ordem).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

        const sql = `
            SELECT
                p.id_pedido AS pedido_id,
                COALESCE(c.nome, 'Cliente') AS cliente,
                COALESCE(c.telefone, '') AS cliente_telefone,
                COALESCE(ca.nome, 'Caçamba') AS cacamba_nome,
                COALESCE(ca.tipo, 'obra') AS cacamba_tipo,
                COALESCE(a.empresa, 'Empresa') AS empresa,
                p.data AS data_pedido,
                p.status,
                p.valor,
                COUNT(*) OVER() AS total_registros
            FROM pedidos p
            LEFT JOIN clientes c
                ON p.id_cliente = c.id_cliente
            LEFT JOIN cacambas ca
                ON p.id_cacamba = ca.id_cacamba
            LEFT JOIN afiliados a
                ON COALESCE(p.id_afiliado, ca.id_afiliado) = a.id_afiliado
            ${statusFilter}
            ORDER BY p.id_pedido ${direcao}
            LIMIT $1
            OFFSET $2;
        `;

        const resultado = await pool.query(sql, params);
        return resultado.rows;
    }

    static async buscarClientes() {
        const sql = `
            SELECT 
                c.id_cliente,
                c.nome,
                c.email,
                c.telefone,
                c.cep,
                c.endereco,
                COUNT(p.id_pedido) AS total_pedidos
            FROM clientes c
            LEFT JOIN pedidos p
                ON c.id_cliente = p.id_cliente
            GROUP BY c.id_cliente, c.nome, c.email, c.telefone, c.cep, c.endereco
            ORDER BY c.id_cliente;
        `;
        const resultado = await pool.query(sql);
        return resultado.rows;
    }

    static async buscarCacambas() {
        const sql = `
            SELECT 
                ca.id_cacamba,
                ca.nome,
                ca.tipo,
                ca.capacidade,
                ca.dimensoes,
                ca.peso_max,
                ca.preco,
                ca.disponivel,
                a.empresa AS empresa_afiliado,
                a.cidade AS cidade_afiliado
            FROM cacambas ca
            JOIN afiliados a
                ON ca.id_afiliado = a.id_afiliado
            ORDER BY ca.id_cacamba DESC;
        `;
        const resultado = await pool.query(sql);
        return resultado.rows;
    }

    static async buscarAfiliados() {
        const sql = `
            SELECT 
                a.id_afiliado,
                a.empresa,
                a.cnpj,
                a.telefone,
                a.cidade,
                a.estado,
                COUNT(DISTINCT ca.id_cacamba) AS total_cacambas,
                COUNT(DISTINCT p.id_pedido) AS total_pedidos
            FROM afiliados a
            LEFT JOIN cacambas ca
                ON a.id_afiliado = ca.id_afiliado
            LEFT JOIN pedidos p
                ON a.id_afiliado = p.id_afiliado
            GROUP BY a.id_afiliado, a.empresa, a.cnpj, a.telefone, a.cidade, a.estado
            ORDER BY a.id_afiliado;
        `;
        const resultado = await pool.query(sql);
        return resultado.rows;
    }

    static async buscarEstatisticas() {
        const sql = `
            SELECT 
                (SELECT COUNT(*) FROM clientes)::int AS total_clientes,
                (SELECT COUNT(*) FROM afiliados)::int AS total_afiliados,
                (SELECT COUNT(*) FROM cacambas)::int AS total_cacambas,
                (SELECT COUNT(*) FROM pedidos)::int AS total_pedidos,
                (SELECT COALESCE(SUM(valor), 0) FROM pedidos)::numeric AS faturamento_total,
                (SELECT COUNT(*) FROM pedidos WHERE status = 'concluido')::int AS pedidos_concluidos,
                (SELECT COUNT(*) FROM pedidos WHERE status = 'pendente')::int AS pedidos_pendentes,
                (SELECT COUNT(*) FROM pedidos WHERE status = 'entregue')::int AS pedidos_entregues;
        `;
        const resultado = await pool.query(sql);
        return resultado.rows[0];
    }

    static async buscarPedidoPorId(id) {
        const sql = `
            SELECT
                p.id_pedido,
                c.id_cliente,
                c.nome AS cliente,
                c.email AS cliente_email,
                c.telefone AS cliente_telefone,
                ca.id_cacamba,
                ca.nome AS cacamba_nome,
                ca.tipo AS cacamba_tipo,
                ca.dimensoes,
                ca.capacidade,
                a.id_afiliado,
                a.empresa,
                a.telefone AS empresa_telefone,
                p.data AS data_pedido,
                p.data_fim,
                p.status,
                p.valor,
                p.endereco AS endereco_entrega,
                p.criado_em
            FROM pedidos p
            LEFT JOIN clientes c ON p.id_cliente = c.id_cliente
            LEFT JOIN cacambas ca ON p.id_cacamba = ca.id_cacamba
            LEFT JOIN afiliados a ON COALESCE(p.id_afiliado, ca.id_afiliado) = a.id_afiliado
            WHERE p.id_pedido = $1;
        `;
        const resultado = await pool.query(sql, [id]);
        return resultado.rows[0] || null;
    }

    static async buscarClientePorId(id) {
        const sql = `
            SELECT 
                c.id_cliente,
                c.nome,
                c.email,
                c.telefone,
                c.cep,
                c.endereco,
                c.ativo,
                c.criado_em,
                COUNT(p.id_pedido) AS total_pedidos
            FROM clientes c
            LEFT JOIN pedidos p ON c.id_cliente = p.id_cliente
            WHERE c.id_cliente = $1
            GROUP BY c.id_cliente, c.nome, c.email, c.telefone, c.cep, c.endereco, c.ativo, c.criado_em;
        `;
        const resultado = await pool.query(sql, [id]);
        return resultado.rows[0] || null;
    }

    static async buscarCacambaPorId(id) {
        const sql = `
            SELECT 
                ca.id_cacamba,
                ca.nome,
                ca.tipo,
                ca.capacidade,
                ca.dimensoes,
                ca.peso_max,
                ca.preco,
                ca.descricao,
                ca.disponivel,
                ca.criado_em,
                a.id_afiliado,
                a.empresa AS empresa_afiliado,
                a.cidade AS cidade_afiliado,
                a.telefone AS telefone_afiliado
            FROM cacambas ca
            JOIN afiliados a ON ca.id_afiliado = a.id_afiliado
            WHERE ca.id_cacamba = $1;
        `;
        const resultado = await pool.query(sql, [id]);
        return resultado.rows[0] || null;
    }

    static async buscarAfiliadoPorId(id) {
        const sql = `
            SELECT 
                a.id_afiliado,
                a.empresa,
                a.cnpj,
                a.email,
                a.telefone,
                a.cidade,
                a.estado,
                a.ativo,
                a.criado_em,
                COUNT(DISTINCT ca.id_cacamba) AS total_cacambas,
                COUNT(DISTINCT p.id_pedido) AS total_pedidos
            FROM afiliados a
            LEFT JOIN cacambas ca ON a.id_afiliado = ca.id_afiliado
            LEFT JOIN pedidos p ON a.id_afiliado = p.id_afiliado
            WHERE a.id_afiliado = $1
            GROUP BY a.id_afiliado, a.empresa, a.cnpj, a.email, a.telefone, a.cidade, a.estado, a.ativo, a.criado_em;
        `;
        const resultado = await pool.query(sql, [id]);
        return resultado.rows[0] || null;
    }

    static async criarCacamba(dados) {
        let idAfiliado = parseInt(dados.id_afiliado || dados.afiliadoId, 10);
        let afRow = null;

        if (!isNaN(idAfiliado) && idAfiliado > 0) {
            const resAf = await pool.query('SELECT id_afiliado FROM afiliados WHERE id_afiliado = $1', [idAfiliado]);
            if (resAf.rows.length) afRow = resAf.rows[0];
        }

        if (!afRow && (dados.afiliadoEmail || dados.email)) {
            const resEmail = await pool.query('SELECT id_afiliado FROM afiliados WHERE email = $1', [dados.afiliadoEmail || dados.email]);
            if (resEmail.rows.length) afRow = resEmail.rows[0];
        }

        if (!afRow) {
            const primeiroAf = await pool.query('SELECT id_afiliado FROM afiliados ORDER BY id_afiliado ASC LIMIT 1');
            idAfiliado = primeiroAf.rows[0]?.id_afiliado || 1;
        } else {
            idAfiliado = afRow.id_afiliado;
        }

        const sql = `
            INSERT INTO cacambas (
                id_afiliado, nome, tipo, capacidade, dimensoes, peso_max, preco, descricao, imagem, disponivel, criado_em
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()
            ) RETURNING *;
        `;
        const params = [
            idAfiliado,
            dados.nome,
            dados.tipo || 'obra',
            dados.capacidade || '3m³',
            dados.dimensoes || '1,80 x 1,20 x 0,80m',
            dados.peso_max || '2 ton',
            parseFloat(dados.preco || 0),
            dados.descricao || '',
            dados.imagem || null,
            dados.disponivel !== false
        ];

        const resultado = await pool.query(sql, params);
        return resultado.rows[0];
    }

    static async criarAfiliado(dados) {
        const empresa = (dados.empresa || dados.nome || '').trim() || 'Empresa Sem Nome';
        const cnpj = (dados.cnpj || '').trim() || null;
        const email = (dados.email || `afiliado_${Date.now()}@locafacil.com`).trim().toLowerCase();
        const senhaHash = dados.senha_hash || dados.senha || 'hash_afiliado_padrao';
        const telefone = (dados.telefone || dados.tel || '').trim() || null;
        const cidade = (dados.cidade || 'Volta Redonda').trim();
        const estado = ((dados.estado || 'RJ').trim().toUpperCase() || 'RJ').slice(0, 2);

        // Se já existe afiliado com esse email no Neon, retorna o existente
        const check = await pool.query('SELECT * FROM afiliados WHERE LOWER(email) = LOWER($1)', [email]);
        if (check.rows.length > 0) {
            return check.rows[0];
        }

        const sql = `
            INSERT INTO afiliados (
                empresa, cnpj, email, senha_hash, telefone, cidade, estado, ativo, criado_em
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, true, NOW()
            ) RETURNING *;
        `;
        const params = [empresa, cnpj, email, senhaHash, telefone, cidade, estado];
        const resultado = await pool.query(sql, params);
        return resultado.rows[0];
    }

    static async criarCliente(dados) {
        const nome = (dados.nome || dados.cliente || '').trim() || 'Cliente';
        const email = (dados.email || `cliente_${Date.now()}@locafacil.com`).trim().toLowerCase();
        const senhaHash = dados.senha_hash || dados.senha || 'hash_cliente_padrao';
        const cep = (dados.cep || '').trim() || null;
        const telefone = (dados.telefone || dados.tel || '').trim() || null;
        const endereco = (dados.endereco || '').trim() || null;

        const check = await pool.query('SELECT * FROM clientes WHERE LOWER(email) = LOWER($1)', [email]);
        if (check.rows.length > 0) {
            return check.rows[0];
        }

        const sql = `
            INSERT INTO clientes (
                nome, email, senha_hash, cep, telefone, endereco, ativo, criado_em
            ) VALUES (
                $1, $2, $3, $4, $5, $6, true, NOW()
            ) RETURNING *;
        `;
        const params = [nome, email, senhaHash, cep, telefone, endereco];
        const resultado = await pool.query(sql, params);
        return resultado.rows[0];
    }

    static async criarPedido(dados) {
        // 1. Resolver id_cliente garantindo existência no Neon
        let idCliente = parseInt(dados.id_cliente || dados.clienteId, 10);
        let cliRow = null;

        if (!isNaN(idCliente) && idCliente > 0) {
            const resCli = await pool.query('SELECT id_cliente FROM clientes WHERE id_cliente = $1', [idCliente]);
            if (resCli.rows.length) cliRow = resCli.rows[0];
        }

        if (!cliRow && (dados.clienteEmail || dados.email)) {
            const porEmail = await pool.query('SELECT id_cliente FROM clientes WHERE LOWER(email) = LOWER($1)', [dados.clienteEmail || dados.email]);
            if (porEmail.rows.length) cliRow = porEmail.rows[0];
        }

        if (!cliRow && (dados.clienteNome || dados.cliente)) {
            const porNome = await pool.query('SELECT id_cliente FROM clientes WHERE LOWER(nome) = LOWER($1)', [dados.clienteNome || dados.cliente]);
            if (porNome.rows.length) cliRow = porNome.rows[0];
        }

        if (!cliRow) {
            if (dados.clienteNome || dados.cliente) {
                cliRow = await this.criarCliente({
                    nome: dados.clienteNome || dados.cliente,
                    email: dados.clienteEmail || dados.email || `cliente_${Date.now()}@locafacil.com`,
                    telefone: dados.clienteTelefone || dados.telefone || null,
                    endereco: dados.endereco || null
                });
                idCliente = cliRow.id_cliente;
            } else {
                const primeiroCli = await pool.query('SELECT id_cliente FROM clientes ORDER BY id_cliente ASC LIMIT 1');
                idCliente = primeiroCli.rows[0]?.id_cliente || 1;
            }
        } else {
            idCliente = cliRow.id_cliente;
        }

        // 2. Resolver id_afiliado garantindo existência no Neon
        let idAfiliado = parseInt(dados.id_afiliado || dados.afiliadoId, 10);
        let afRow = null;

        if (!isNaN(idAfiliado) && idAfiliado > 0) {
            const resAf = await pool.query('SELECT id_afiliado FROM afiliados WHERE id_afiliado = $1', [idAfiliado]);
            if (resAf.rows.length) afRow = resAf.rows[0];
        }

        if (!afRow && (dados.afiliadoEmail || dados.empresaEmail)) {
            const resEmail = await pool.query('SELECT id_afiliado FROM afiliados WHERE LOWER(email) = LOWER($1)', [dados.afiliadoEmail || dados.empresaEmail]);
            if (resEmail.rows.length) afRow = resEmail.rows[0];
        }

        if (!afRow && (dados.empresa || dados.afiliadoNome || dados.nomeAfiliado)) {
            const empNome = dados.empresa || dados.afiliadoNome || dados.nomeAfiliado;
            const resNome = await pool.query('SELECT id_afiliado FROM afiliados WHERE LOWER(empresa) = LOWER($1)', [empNome]);
            if (resNome.rows.length) afRow = resNome.rows[0];
        }

        // Se a empresa ainda não existir no Neon mas foi informada, CRIA ELA NO NEON
        if (!afRow && (dados.empresa || dados.afiliadoNome || dados.nomeAfiliado)) {
            afRow = await this.criarAfiliado({
                empresa: dados.empresa || dados.afiliadoNome || dados.nomeAfiliado,
                cnpj: dados.cnpj || null,
                email: dados.afiliadoEmail || dados.empresaEmail || `empresa_${Date.now()}@locafacil.com`,
                telefone: dados.afiliadoTelefone || dados.telefoneEmpresa || null,
                cidade: dados.cidade || 'Volta Redonda',
                estado: dados.estado || 'RJ'
            });
            idAfiliado = afRow.id_afiliado;
        }

        // 3. Resolver id_cacamba garantindo existência no Neon
        let idCacamba = parseInt(dados.id_cacamba || dados.cacambaId, 10);
        let cacRow = null;

        if (!isNaN(idCacamba) && idCacamba > 0) {
            const resCac = await pool.query('SELECT id_cacamba, id_afiliado FROM cacambas WHERE id_cacamba = $1', [idCacamba]);
            if (resCac.rows.length) cacRow = resCac.rows[0];
        }

        if (!cacRow && (dados.cacambaNome || dados.nomeCacamba)) {
            const cacNome = dados.cacambaNome || dados.nomeCacamba;
            const resCacNome = await pool.query('SELECT id_cacamba, id_afiliado FROM cacambas WHERE LOWER(nome) = LOWER($1)', [cacNome]);
            if (resCacNome.rows.length) cacRow = resCacNome.rows[0];
        }

        if (!cacRow) {
            if (afRow && afRow.id_afiliado) {
                const cacAf = await pool.query('SELECT id_cacamba, id_afiliado FROM cacambas WHERE id_afiliado = $1 LIMIT 1', [afRow.id_afiliado]);
                if (cacAf.rows.length) cacRow = cacAf.rows[0];
            }
            if (!cacRow) {
                const primeiraCac = await pool.query('SELECT id_cacamba, id_afiliado FROM cacambas ORDER BY id_cacamba DESC LIMIT 1');
                cacRow = primeiraCac.rows[0];
            }
            idCacamba = cacRow?.id_cacamba || 1;
        } else {
            idCacamba = cacRow.id_cacamba;
        }

        if (!afRow) {
            if (cacRow && cacRow.id_afiliado) {
                idAfiliado = cacRow.id_afiliado;
            } else {
                const primeiroAf = await pool.query('SELECT id_afiliado FROM afiliados ORDER BY id_afiliado ASC LIMIT 1');
                idAfiliado = primeiroAf.rows[0]?.id_afiliado || 1;
            }
        } else {
            idAfiliado = afRow.id_afiliado;
        }

        const dataInicio = dados.data ? new Date(dados.data) : new Date();
        const dataFim = dados.dataFim ? new Date(dados.dataFim) : null;
        const valor = parseFloat(dados.valor || 250);
        const status = dados.status || 'pendente';
        const endereco = dados.endereco || 'Endereço não informado';

        const sql = `
            INSERT INTO pedidos (
                id_cliente, id_cacamba, id_afiliado, status, data, data_fim, valor, endereco, criado_em
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, NOW()
            ) RETURNING *;
        `;
        const params = [
            idCliente,
            idCacamba,
            idAfiliado,
            status,
            dataInicio,
            dataFim,
            valor,
            endereco
        ];

        const resultado = await pool.query(sql, params);
        const novoPedido = resultado.rows[0];

        // Traz o pedido com os nomes relacionados já preenchidos
        const detalhe = await this.buscarPedidoPorId(novoPedido.id_pedido);
        return detalhe || novoPedido;
    }
}

module.exports = ClientRepository;