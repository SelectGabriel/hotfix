app.factory('errorHandler', function() {

    const client = ZAFClient.init();

    return {
        handleError: function(msg) {
            // Implemente a lógica para lidar com o erro e exibir a mensagem ao usuário
            alert('Ocorreu um erro: ' + error.message);
        },

        handleSucess: function(msg) {
            client.invoke('notify', 'Erro ao excluir o template, provavelmente para este template já foi solicitado a exclusão.', 'error', 20000)
        }
    };
});