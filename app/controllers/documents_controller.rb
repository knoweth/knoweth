class DocumentsController < ApplicationController
  before_action :authenticate_user!

  def index
    @documents = Document.where(user: current_user)
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
      format.json { }
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
    @document.user = current_user
    # Initial document content here
    # The document has to have a single top-level node that holds all the other
    # content elements, because otherwise stuff like ExitBreakPlugin breaks
    # since it assumes all the root elements are at level 1, not 0
    # see https://github.com/udecode/slate-plugins/blob/next/stories/config/initialValues.ts
    # and https://github.com/udecode/slate-plugins/blob/add7ec377ffd55387328eee71902b77d7c0e8407/packages/slate-plugins/src/handlers/exit-break/onKeyDownExitBreak.ts#L69
    @document.content = '[
        {
          "children": [
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
