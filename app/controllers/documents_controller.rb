class DocumentsController < ApplicationController
  before_action :authenticate_user!

  def index
    @documents = Document.where(user_id: current_user.id)
  end

  def show
    current_document_with_user_validation
  end

  # Called from js by the document editor and by renaming form page
  def update
    current_document_with_user_validation
    @document.update!(document_params)

    # Only redirect when an update is done if it was called from a form (non-
    # json output requested)
    respond_to do |format|
      format.json {}
      format.html {
        redirect_to document_url(@document)
      }
    end
  end

  def new
  end

  def rename
    current_document_with_user_validation
  end

  def create
    @document = Document.new(document_params)
    @document.user_id = current_user.id
    # Initial document content here
    @document.content = '[
        {
          "type": "h1",
          "children": [
            {
              "text": "Test Question"
            }
          ]
        },
        {
          "type": "table",
          "children": [
            {
              "type": "tr",
              "children": [
                {
                  "type": "td",
                  "children": [{ "text": "Question", "bold": true }]
                },
                {
                  "type": "td",
                  "children": [{ "text": "Answer", "bold": true }]
                }
              ]
            }
          ]
        }
      ]'
    @document.save!
    redirect_to @document
  end

  def destroy
    @document = Document.find(params[:id])
    @document.destroy
    redirect_to documents_url, :notice => "Successfully deleted document."
  end

  def review
    current_document_with_user_validation
    @knowledges = Knowledge.where(document_id: @document.id).to_json
  end

  private
    def document_params
      params.require(:document).permit(:title, :content)
    end

    def current_document_with_user_validation
      @document = Document.find(params[:id])

      if @document.user != current_user
        flash[:alert] = "Can't access a document you don't own."
        redirect_to document_path
      end
    end
end
