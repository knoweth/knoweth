class DocumentsController < ApplicationController
  before_action :authenticate_user!

  def index
    @documents = Document.where(user_id: current_user.id)
  end

  def show
    @document = Document.find(params[:id])

    if @document.user != current_user
      flash[:alert] = "Can't access a document you don't own."
      redirect_to document_path
    end
  end

  # Called from js by the document editor
  def update
    @document = Document.find(params[:id])
    @document.update!(document_params)
  end

  def new
  end

  def create
    @document = Document.new(document_params)
    @document.user_id = current_user.id
    # Initial document content here
    @document.content = '[
        {
          type: "h1",
          children: [
            {
              text: "Test Question",
            },
          ],
        },
        {
          type: "q-table",
          children: [
            {
              type: "q-note",
              children: [
                {
                  type: "q-cell",
                  children: [{ text: "test" }],
                },
                {
                  type: "q-cell",
                  children: [{ text: "test" }],
                },
              ],
            },
          ],
        },
      ]'
    @document.save!
    redirect_to @document
  end

  private
    def document_params
      params.require(:document).permit(:title, :content)
    end
end
